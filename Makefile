all: clean build publish

clean:
	rm -rf _site/ images/

build:
	@gulp compress minify
	@bundle exec jekyll build


publish:
	@curl -s -o /dev/null -w "Hub: %{http_code}\n" 'https://pubsubhubbub.appspot.com' -d 'hub.mode=publish&hub.url=https://horimisli.me/feed.xml' -X POST
	@curl -s -o /dev/null -w "Sitemap: %{http_code}\n" 'https://www.google.com/webmasters/tools/ping?sitemap=https://horimisli.me/sitemap.xml'

preview:
	/bin/cp -r _images/ images/
	@bundle exec jekyll serve --future --watch --livereload
