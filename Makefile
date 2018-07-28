clean:
	rm -rf _site/ images/

publish:
	gulp compress minify
	bundle exec jekyll build

preview:
	/bin/cp -r _images/ images/
	bundle exec jekyll serve --future --watch --livereload
