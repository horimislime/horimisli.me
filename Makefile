all: build publish

clean:
	rm -rf _site/ images/

prepare-img:
	/bin/cp -r _images/ images/
	find images/ -name '*.jpg' -or -name '*.png' | xargs -I {} convert {} -resize '2048x>' {}
	find images/ -name '*.png' | xargs -I {} zopflipng -my {} {}
	# find images/ -name '*.jpg' | xargs -I {} guetzli --quality 99 --verbose {} {}

build:
	bundle exec jekyll build

publish:
	@curl -s -o /dev/null -w "Hub: %{http_code}\n" 'https://pubsubhubbub.appspot.com' -d 'hub.mode=publish&hub.url=https://horimisli.me/feed.xml' -X POST
	@curl -s -o /dev/null -w "Sitemap: %{http_code}\n" 'https://www.google.com/webmasters/tools/ping?sitemap=https://horimisli.me/sitemap.xml'

preview:
	@bundle exec jekyll serve --future --watch --livereload
