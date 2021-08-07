javascript: (() => {
  const productUrl = document
    .querySelector('link[rel="canonical"]')
    .href.replace(/amazon.co.jp\/.*\/dp/, 'amazon.co.jp/dp');
  const imageUrl = document.querySelector('#main-image-container img')
    .attributes['src'].textContent;
  const title = document.querySelector('#productTitle').innerText;
  const detailElement = document.querySelector('#bylineInfo');
  const detail = detailElement == undefined ? '' : detailElement.innerText;
  const elements =
    '<div class="flex items-center m-4"><div class="amazon-image"><a href="' +
    productUrl +
    '" target="_blank"> <img src="' +
    imageUrl +
    '" class="max-h-60"> </a> </div> <div class="m-8"> <p>' +
    title +
    '<br/>' +
    detail +
    '</p> <p class="underline font-medium"> <a href="' +
    productUrl +
    '" target="_blank">Amazon の商品ページへ</a> </p> </div> </div>';
  alert(elements);
})();
