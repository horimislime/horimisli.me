all: build publish

build:
	npm run prod

publish:
	@curl -s -o /dev/null -w "Hub: %{http_code}\n" 'https://pubsubhubbub.appspot.com' -d 'hub.mode=publish&hub.url=https://horimisli.me/feed.xml' -X POST
	@curl -s -o /dev/null -w "Sitemap: %{http_code}\n" 'https://www.google.com/webmasters/tools/ping?sitemap=https://horimisli.me/sitemap.xml'

preview:
	npm run dev

push_articles:
	cd _posts && git add . && git commit -m "Add post" && git push origin `git rev-parse --abbrev-ref HEAD` && cd ..
	cd _images && git add . && git commit -m "Add image" && git push origin `git rev-parse --abbrev-ref HEAD` && cd ..
