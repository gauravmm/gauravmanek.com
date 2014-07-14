#!/usr/bin/python3

import random
import svgwrite
from svgwrite import rgb


def bkggen_square(name):

	# image size
	img_draw_sz = "6cm"
	img_cell_count = 24
	img_cell_sz = 5
	img_gutter_sz = 1

	colors = [rgb(col, col, col) for col in [246, 248, 250, 252, 255]]

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


def bkggen_triangle(name):

	# image size
	img_draw_wd = "5.5cm"
	img_draw_ht = "6cm"
	img_cell_count = 12
	img_cell_sz = 5
	img_gutter_sz = 1

	colors = [rgb(col, col, col) for col in [246, 248, 250, 252, 255]]
	#colors = [rgb(0, 0, 0)]

	dwg = svgwrite.Drawing(name, (img_draw_wd, img_draw_ht), debug=True)
	# Define a user coordinate system:
	img_user_sz = (img_cell_sz + img_gutter_sz) * img_cell_count

	#Scale everything by 2 to prevent weird round-off errors
	img_cell_sz *= 2
	img_gutter_sz *= 2
	img_user_sz *= 2

	dwg.viewbox(0, 0,
		(img_cell_sz + img_gutter_sz/2) * img_cell_count,
		(img_cell_sz + img_gutter_sz) * img_cell_count)

	#dwg.add(dwg.rect(insert=(0, 0), size=((img_cell_sz + img_gutter_sz/2) * img_cell_count, (img_cell_sz + img_gutter_sz) * img_cell_count), fill=rgb(128, 0, 0)))

	color_band_first = None
	for _Cy in range(img_cell_count * 2) + [-1]:
		_y = _Cy * (img_cell_sz + img_gutter_sz) / 2 + img_gutter_sz/2
		color_band = [random.choice(colors) for _Cx in range(img_cell_count)]

		if color_band_first is None:
			color_band_first = color_band
		elif _Cy == -1:
			color_band = color_band_first

		for _Cx, _fill in enumerate(color_band):
			_x = _Cx * (img_cell_sz + img_gutter_sz / 2)

			if _fill is not None:
				if (_Cx + _Cy) % 2 == 0:
					dwg.add(dwg.polygon(points=[(_x, _y), (_x + img_cell_sz, _y + img_cell_sz/2), (_x, _y + img_cell_sz)], fill=_fill))
				else:
					dwg.add(dwg.polygon(points=[(_x + img_cell_sz, _y), (_x, _y + img_cell_sz/2), (_x + img_cell_sz, _y + img_cell_sz)], fill=_fill))

	dwg.save()

if __name__ == '__main__':
	bkggen_triangle("../source/img/bkg.svg")
