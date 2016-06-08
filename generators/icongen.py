#!/usr/bin/python3

import random
import svgwrite
from svgwrite import rgb

image = [
	[0, 0, 0, 0, 0],
	[1, 1, 1, 1, 0],
	[1, 1, 1, 1, 1],
	[1, 0, 1, 0, 1],
	[1, 0, 1, 0, 1],
	[1, 0, 1, 0, 1],
	[1, 0, 0, 0, 1],
	[0, 0, 0, 0, 1]]


def bkggen_triangle(name, image):

	# image size
	img_draw_wd = "152px"
	img_draw_ht = "152px"
	img_cell_count = 5
	img_cell_sz = 13
	img_gutter_sz = 3

	dwg = svgwrite.Drawing(name, (img_draw_wd, img_draw_ht), debug=True)
	# Define a user coordinate system:
	img_user_sz = (img_cell_sz + img_gutter_sz) * img_cell_count

	#Scale everything by 2 to prevent weird round-off errors
	img_cell_sz *= 2
	img_gutter_sz *= 2
	img_user_sz *= 2

	dwg.viewbox(0, 0, img_user_sz, img_user_sz)
	# Horizontal Center:
	padding_left = (img_user_sz - (img_gutter_sz/2 * (img_cell_count - 1)) - (img_cell_sz * img_cell_count)) / 2
	padding_top = 0
	# Background
	#dwg.add(dwg.rect(insert=(0, 0), size=(img_user_sz, img_user_sz), fill="#542437"))
	shapes = dwg.add(dwg.g(fill='white'))

	for _Cy, color_band in enumerate(image):
		_y = padding_top + _Cy * (img_cell_sz + img_gutter_sz) / 2 + img_gutter_sz/2

		for _Cx, _fill in enumerate(color_band):
			_x = padding_left + _Cx * (img_cell_sz + img_gutter_sz / 2)

			if _fill == 1:
				if (_Cx + _Cy) % 2 == 0:
					shapes.add(dwg.polygon(points=[(_x, _y), (_x + img_cell_sz, _y + img_cell_sz/2), (_x, _y + img_cell_sz)]))
				else:
					shapes.add(dwg.polygon(points=[(_x + img_cell_sz, _y), (_x, _y + img_cell_sz/2), (_x + img_cell_sz, _y + img_cell_sz)]))

	dwg.save()

if __name__ == '__main__':
	bkggen_triangle("./logo/logo-gen-162-13-3.svg", image)
