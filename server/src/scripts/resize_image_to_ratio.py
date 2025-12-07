import cv2
import math


def resize(file, target_type, target_width, target_height):
    image = cv2.imread(file)
    if image is None:
        return

    width = image.shape[1]
    height = image.shape[0]

    print("width:", width, "height:", height)

    # check if is wrong ratio
    actualRatio = width / height
    wantedRatio = target_width / target_height
    if not math.isclose(actualRatio, wantedRatio):
        print("wrong ratio")
        fromWidth = 0
        toWidth = width
        fromHeight = 0
        toHeight = height

        # check if cropping width or height
        if actualRatio > wantedRatio:
            print("crop width")
            new_width = int(wantedRatio * height)
            toRemove = width - new_width
            print("toCrop:", toRemove)
            fromWidth = toRemove // 2
            toWidth = width - (toRemove // 2)
        else:
            print("crop height")
            new_height = int(width / wantedRatio)
            toRemove = height - new_height
            print("toCrop:", toRemove)
            fromHeight = toRemove // 2
            toHeight = height - (toRemove // 2)
        # crop image
        image = image[fromHeight:toHeight, fromWidth:toWidth]

    print("wratio:", wantedRatio)
    print("aratio:", actualRatio)

    # resize image
    image = cv2.resize(image, (target_width, target_height))

    # write to file without file ending
    success, buffer = cv2.imencode(target_type, image)
    if not success:
        return

    buffer.tofile(file)
