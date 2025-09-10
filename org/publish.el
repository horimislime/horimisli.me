;;; publish.el --- Publish org/ to out/ as static HTML -*- lexical-binding: t; -*-

;; Usage (batch):
;;   emacs --batch -Q -l org/publish.el -f horimislime/publish
;; Usage (interactive): load this file, then
;;   M-x horimislime/publish   (or M-x org-publish RET horimisli.me)
;;
;; Layout:
;;   org/index.org                   -> out/index.html
;;   org/entry/<slug>/content.org    -> out/entry/<slug>/index.html
;;   org/**/*.{css,js,png,jpg,gif..} -> out/** (copied as-is)

(require 'org)
(require 'ox-html)
(require 'ox-publish)
(require 'url-util)

(defconst horimislime/root
  (file-name-directory (directory-file-name
                        (file-name-directory (or load-file-name buffer-file-name))))
  "Repository root.")

(defconst horimislime/site-url "https://horimisli.me")
(defconst horimislime/site-name "horimisli.me")
(defconst horimislime/org-dir (expand-file-name "org" horimislime/root))
(defconst horimislime/out-dir (expand-file-name "out" horimislime/root))
(defconst horimislime/entry-dir (expand-file-name "entry" horimislime/org-dir))

;;; Shared page parts

(defconst horimislime/html-head
  "<link rel=\"icon\" href=\"/favicon.png\">
<link rel=\"stylesheet\" href=\"/assets/style.css\">
<link rel=\"author\" href=\"https://www.hatena.ne.jp/horimislime/\">
<link rel=\"alternate\" type=\"application/rss+xml\" title=\"horimisli.me\" href=\"/feed.xml\">
<script async src=\"https://www.googletagmanager.com/gtag/js?id=UA-30891696-5\"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','UA-30891696-5',{page_path:location.pathname});</script>")

(defconst horimislime/preamble
  "<header>
  <nav>
    <a class=\"home-button\" href=\"/\"><span id=\"home-emoji\">🏠</span> horimisli.me</a>
    <a href=\"/entry\">Archive</a>
    <a href=\"/feed.xml\">Feed</a>
  </nav>
  <script>(function(){var e=['🍣','🍙','🍵','🐈','🐟','🌸','🌙','⚡','🎧','📷','🚲','🧪','🛠','🍺','🎈'];document.getElementById('home-emoji').textContent=e[Math.floor(Math.random()*e.length)];})();</script>
</header>
<hr>")

(defconst horimislime/postamble
  "<hr>
<footer>
  ©︎ horimislime<br>
  Served by <a href=\"https://github.com/horimislime/horimisli.me\">horimislime/horimisli.me</a>
</footer>")

;;; Entries

(defun horimislime/parse-date (s)
  "Return (YYYY MM DD) from a DATE string such as \"2025-07-08 00:01\" or \"<2025-07-08 Tue>\"."
  (when (and s (string-match "\\([0-9]\\{4\\}\\)-\\([0-9]\\{2\\}\\)-\\([0-9]\\{2\\}\\)" s))
    (list (match-string 1 s) (match-string 2 s) (match-string 3 s))))

(defun horimislime/entries ()
  "List entries under org/entry/<slug>/content.org, newest first.
Each element is a plist (:slug :title :date)."
  (let (entries)
    (dolist (file (file-expand-wildcards
                   (expand-file-name "*/content.org" horimislime/entry-dir)))
      (with-temp-buffer
        (insert-file-contents file)
        (delay-mode-hooks (org-mode))
        (let* ((kw (org-collect-keywords '("TITLE" "DATE" "DRAFT")))
               (title (cadr (assoc "TITLE" kw)))
               (date (cadr (assoc "DATE" kw)))
               (draft (cadr (assoc "DRAFT" kw))))
          (unless (and draft (not (member draft '("nil" "false" "no"))))
            (push (list :slug (file-name-nondirectory
                               (directory-file-name (file-name-directory file)))
                        :title title
                        :date date)
                  entries)))))
    (sort entries (lambda (a b) (string> (or (plist-get a :date) "")
                                         (or (plist-get b :date) ""))))))

(defun horimislime/recent-entries-org (&optional n)
  "Return an org list of the N most recent entries (used by the
{{{recent-entries(N)}}} macro)."
  (let* ((n (if (and n (not (string-empty-p n))) (string-to-number n) 5))
         (entries (seq-take (horimislime/entries) n)))
    (mapconcat
     (lambda (e)
       (format "- @@html:<time>%s</time>@@ [[site:/entry/%s/][%s]]"
               (string-join (or (horimislime/parse-date (plist-get e :date)) '("")) "/")
               (plist-get e :slug)
               (plist-get e :title)))
     entries "\n")))

;;; Links

;; [[site:/entry/foo/][Title]] -> <a href="/entry/foo/">Title</a>
;; Plain [[/entry/foo/]] would be treated as a local file link (file:///...).
(org-link-set-parameters
 "site"
 :follow (lambda (path _) (browse-url (concat horimislime/site-url path)))
 :export (lambda (path desc backend _info)
           (when (org-export-derived-backend-p backend 'html)
             (format "<a href=\"%s\">%s</a>"
                     (url-encode-url path) (or desc path)))))

(defun horimislime/link-filter (text _backend _info)
  "Make links to this site relative; open other external links in a new tab."
  (let ((self (concat "\\`<a href=\"" (regexp-quote horimislime/site-url))))
    (cond
     ((string-match-p self text)
      (replace-regexp-in-string self "<a href=\"" text t t))
     ((string-match-p "\\`<a href=\"https?://" text)
      (replace-regexp-in-string
       "\\`<a " "<a target=\"_blank\" rel=\"noopener noreferrer\" " text t t))
     (t text))))

;;; Backend

(defun horimislime/page-path (info)
  "Site path of the page being exported, e.g. \"/\" or \"/entry/foo/\"."
  (let* ((rel (file-relative-name (plist-get info :input-file) horimislime/org-dir))
         (dir (file-name-directory rel))
         (base (file-name-base rel)))
    (concat "/" (or dir "")
            (unless (member base '("index" "content")) (concat base ".html")))))

(defun horimislime/inject-meta (output _backend info)
  "Insert per-page OGP / Twitter card meta tags before </head>."
  (let* ((title (org-export-data (plist-get info :title) info))
         (title (if (or (string-empty-p title) (string= title horimislime/site-name))
                    horimislime/site-name
                  title))
         (image (plist-get info :og-image))
         (image (if (and image (not (string-empty-p image)))
                    (concat horimislime/site-url image)
                  (concat horimislime/site-url "/images/og_profile.jpg")))
         (meta (mapconcat
                (lambda (kv) (format "<meta %s=\"%s\" content=\"%s\">"
                                     (if (string-prefix-p "og:" (car kv)) "property" "name")
                                     (car kv)
                                     (org-html-encode-plain-text (cdr kv))))
                `(("og:title" . ,title)
                  ("og:url" . ,(concat horimislime/site-url (horimislime/page-path info)))
                  ("og:type" . "article")
                  ("og:description" . "Personal website by horimislime")
                  ("og:image" . ,image)
                  ("twitter:card" . ,(if (plist-get info :og-image) "summary_large_image" "summary"))
                  ("twitter:site" . "@horimislime")
                  ("twitter:image" . ,image))
                "\n")))
    (replace-regexp-in-string "</head>" (concat meta "\n</head>") output t t)))

(defun horimislime/inner-template (contents info)
  "Prepend the publish date on entry pages."
  (concat
   (when (plist-get info :entry-page)
     (let ((d (horimislime/parse-date
               (org-export-data (plist-get info :date) info))))
       (when d (format "<p class=\"entry-date\"><time datetime=\"%s\">%s</time></p>\n"
                       (string-join d "-") (string-join d "/")))))
   (org-html-inner-template contents info)))

(org-export-define-derived-backend 'horimislime-html 'html
  :options-alist '((:og-image "IMAGE" nil nil t))
  :translate-alist '((inner-template . horimislime/inner-template))
  :filters-alist '((:filter-link . horimislime/link-filter)
                   (:filter-final-output . horimislime/inject-meta)))

(defun horimislime/publish-to-html (plist filename pub-dir)
  "Publish FILENAME with `horimislime-html'. content.org becomes index.html."
  (let ((out (org-publish-org-to 'horimislime-html filename ".html" plist pub-dir)))
    (if (string= (file-name-nondirectory out) "content.html")
        (let ((dest (expand-file-name "index.html" (file-name-directory out))))
          (rename-file out dest t)
          dest)
      out)))

;;; Projects

(defconst horimislime/common-page-plist
  `(:base-extension "org"
    :publishing-function horimislime/publish-to-html
    :html-head ,horimislime/html-head
    :html-preamble ,horimislime/preamble
    :html-postamble ,horimislime/postamble
    :html-head-include-default-style nil
    :html-head-include-scripts nil
    :html-validation-link nil
    :html-doctype "html5"
    :html-html5-fancy t
    :html-container "section"
    :html-divs ((preamble "div" "preamble")
                (content "main" "content")
                (postamble "div" "postamble"))
    :language "ja"
    :with-toc nil
    :section-numbers nil
    :with-author nil
    :with-date nil
    :time-stamp-file nil))

(setq org-publish-project-alist
      `(("horimisli.me-pages"
         :base-directory ,horimislime/org-dir
         :publishing-directory ,horimislime/out-dir
         :exclude "\\`setup\\.org\\'\\|\\`entry/"
         :recursive t
         ,@horimislime/common-page-plist)
        ("horimisli.me-entries"
         :base-directory ,horimislime/entry-dir
         :publishing-directory ,(expand-file-name "entry" horimislime/out-dir)
         :recursive t
         :entry-page t
         ,@horimislime/common-page-plist)
        ("horimisli.me-static"
         :base-directory ,horimislime/org-dir
         :publishing-directory ,horimislime/out-dir
         :base-extension "css\\|js\\|png\\|jpe?g\\|gif\\|svg\\|webp\\|ico"
         :recursive t
         :publishing-function org-publish-attachment)
        ("horimisli.me-public"
         ;; Reuse files already in public/ (favicon etc.). Non-recursive so the
         ;; images submodule under public/images is not copied.
         :base-directory ,(expand-file-name "public" horimislime/root)
         :publishing-directory ,horimislime/out-dir
         :base-extension "png\\|txt"
         :recursive nil
         :publishing-function org-publish-attachment)
        ("horimisli.me" :components ("horimisli.me-entries"
                                     "horimisli.me-pages"
                                     "horimisli.me-static"
                                     "horimisli.me-public"))))

(defun horimislime/publish (&optional force)
  "Publish the whole site. With FORCE (or in batch), ignore the timestamp cache."
  (interactive "P")
  (let ((org-publish-use-timestamps-flag (not (or force noninteractive)))
        (org-html-prefer-user-labels t)
        (org-export-allow-bind-keywords nil)
        (make-backup-files nil))
    (org-publish "horimisli.me" t)))

;;; publish.el ends here
