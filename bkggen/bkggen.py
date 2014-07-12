#!/usr/bin/python3

import random
import svgwrite
from svgwrite import rgb


def bkggen(name):

	# image size
	img_draw_sz = "6cm"
	img_cell_count = 24
	img_cell_sz = 5
	img_gutter_sz = 1

	colors = [rgb(col, col, col) for col in [227, 236, 240, 248]] + [None]

	dwg = svgwrite.Drawing(name, (img_draw_sz, img_draw_sz), debug=True)
	# Define a user coordinate system:
	img_user_sz = (img_cell_sz + img_gutter_sz) * img_cell_count
	dwg.viewbox(0, 0, img_user_sz, img_user_sz)

	for _x in range(0, img_user_sz, img_cell_sz + img_gutter_sz):
		for _y in range(0, img_user_sz, img_cell_sz + img_gutter_sz):
			_fill = random.choice(colors)
			if _fill is not None:
				dwg.add(dwg.rect(insert=(_x, _y), size=(img_cell_sz, img_cell_sz), fill=_fill))

	dwg.save()
	## end of http://code.activestate.com/recipes/577111/ }}}

if __name__ == '__main__':
	bkggen("bkg.svg")
