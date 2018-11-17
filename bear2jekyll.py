import os
import sys
import zipfile


class BearNote(object):
    def __init__(self, body, images):
        self.body = body
        self.images = images


class BearFile(object):
    def __init__(self, name, binary):
        self.name = name
        self.binary = binary


def read_bearnote(filepath: str) -> BearNote:

    note_name = os.path.basename(filepath)
    body = None
    images = []
    with zipfile.ZipFile(filepath, 'r') as zip:
        for fileinfo in zip.infolist():
            basename = os.path.basename(fileinfo.filename)
            name, extension = os.path.splitext(fileinfo.filename)
            if extension == '.txt':
                body_bin = zip.read(fileinfo)
                body = BearFile(name=note_name, binary=body_bin)
            elif extension == '.json':
                pass
            else:
                image_bin = zip.read(fileinfo)
                image = BearFile(name=basename, binary=image_bin)
                images.append(image)

    return BearNote(body=body, images=images)


def write_to_jekyll_dir(note: BearNote):
    with open(f'_posts/f{note.body.name}.md', mode='wb') as f:
        f.write(note.body.binary)

    for image in note.images:
        with open(f'_images/{image.name}', mode='wb') as i:
            i.write(image.binary)


def main():
    bearnote_path = sys.argv[1]
    note = read_bearnote(filepath=bearnote_path)
    write_to_jekyll_dir(note=note)


if __name__ == '__main__':
    main()
