all: build publish

build:
	docker-compose run -e JEKYLL_ENV=production -e JEKYLL_UID=1001 -e JEKYLL_GID=116 --rm jekyll-build jekyll build

publish:
	@curl -s -o /dev/null -w "Hub: %{http_code}\n" 'https://pubsubhubbub.appspot.com' -d 'hub.mode=publish&hub.url=https://horimisli.me/feed.xml' -X POST
	@curl -s -o /dev/null -w "Sitemap: %{http_code}\n" 'https://www.google.com/webmasters/tools/ping?sitemap=https://horimisli.me/sitemap.xml'

preview:
	docker-compose down && docker-compose up

push_articles:
	cd _posts && git add . && git commit -m "Add post" && git push origin `git rev-parse --abbrev-ref HEAD` && cd ..
	cd _images && git add . && git commit -m "Add image" && git push origin `git rev-parse --abbrev-ref HEAD` && cd ..