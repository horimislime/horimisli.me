class Page<T> {
  List<T> items;
  bool hasPrev;
  bool hasNext;
  Page(this.items, this.hasPrev, this.hasNext);
}

class Paginator<T> {
  final pages = List<Page<T>>();

  Paginator(List<T> items, int itemsPerPage) {
    final chunkedList = chunk(items, itemsPerPage);

    for (var i = 0; i < chunkedList.length; i++) {
      final hasPrev = i > 0;
      final hasNext = i < chunkedList.length - 1;
      pages.add(Page(chunkedList[i], hasPrev, hasNext));
    }
  }

  List<List<T>> chunk(List<T> items, int chunkSize) {
    final chunkCount = (items.length / chunkSize).ceil();
    return List.generate(
        chunkCount, (i) => items.skip(chunkSize * i).take(chunkSize).toList());
  }
}
