import os
import sys
import zipfile
from datetime import datetime as dt
from io import BytesIO
from PIL import Image


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
    if os.path.splitext(note_name)[1] == '.txt':
        # text only note
        with open(filepath) as f:
            content = f.read()
            md = text_to_markdown(content)
            return BearNote(body=md, images=[])

    body = None
    images = []
    with zipfile.ZipFile(filepath, 'r') as zip:
        for fileinfo in zip.infolist():
            basename = os.path.basename(fileinfo.filename)
            name, extension = os.path.splitext(fileinfo.filename)
            if extension == '.txt':
                text = zip.read(fileinfo).decode('utf-8')
                body = text_to_markdown(text)
            elif extension == '.json':
                pass
            else:
                binary = zip.read(fileinfo)
                image = Image.open(BytesIO(binary))

                if image.width > 1280:
                    ratio = image.height / image.width
                    image = image.resize((1280, int(1280 * ratio)), Image.LANCZOS)

                file = BearFile(name=basename, binary=image)
                images.append(file)

    return BearNote(body=body, images=images)

def text_to_markdown(text):
    body_lines = text.split('\n')
    title = body_lines[0].replace('# ', '')
    lines = [
        '---',
        'layout: post',
        f'title: {title}',
        f'date: {dt.now().strftime("%Y-%m-%d %HH:00")}',
        'category: ["tech"]',
        'published: false',
        '---'
    ]
    for line in body_lines[1:]:
        if line.startswith('[assets/'):
            replaced = line.replace('[assets/', '![](/images/')[:-1] + ')'
            lines.append(replaced)
        else:
            lines.append(line)

    formatted = '\n'.join(lines)
    return BearFile(name=f'{dt.now().strftime("%Y-%m-%d")}-{title.replace(" ", "")}', binary=formatted)

def write_to_jekyll_dir(note: BearNote):
    with open(f'posts/blog/{note.body.name}.md', mode='w') as f:
        f.write(note.body.binary)

    for image in note.images:
        image.binary.save(f'public/images/{image.name}')


def convert(files):
    for file in files:
        if file.startswith('.'):
            print(f'{file} is not image. continue')
            continue

        extension = os.path.splitext(file)[1]
        if extension == '.heic':
            print(f'{file} is unsupported format. continue')
            continue

        image = Image.open(f'_images/{file}')
        if image.height > image.width:
            print(f'{file} is portrait ({image.width}x{image.height}).')
        elif image.width <= 1280:
            print(f'{file} does not need resizing ({image.width}x{image.height}).')
        elif extension == '.gif':
            print(f'{file} is gif.')
        else:
            ratio = image.height / image.width
            resized = image.resize((1280, int(1280 * ratio)), Image.LANCZOS)
            print(f'{file} converted from {image.width}x{image.height} to {resized.width}x{resized.height}')
            image = resized

        image.save(f'public/images/{file}', quality=80, subsampling=0)


def main():
    bearnote_path = sys.argv[1]
    note = read_bearnote(filepath=bearnote_path)
    write_to_jekyll_dir(note=note)


if __name__ == '__main__':
    main()
