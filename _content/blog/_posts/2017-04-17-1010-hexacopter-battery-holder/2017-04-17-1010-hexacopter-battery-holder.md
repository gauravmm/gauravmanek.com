---
title: 1010-class Hexacopter Battery Holder
subtitle: It is vitally important that the battery remains with the hexacopter during the flight.
---

{% include blogimage src="drone.jpg" caption="1010-class Hexacopter" %}

While working in Singapore, I built a large hexacopter. The motor-to-motor span is 1010mm (~3'), with six 15" propellers. It was _huge_, with an all-up weight of 3.3kg (~7 lbs). (Once I dig up some old photos, I'll write about the design decisions involved in making such a large drone.)


One of the crucial parts of the design is the battery mounting caddy. The drone uses 2x Turnigy 4S 10,000 mAh batteries that weight a total of about 900g (~2 lbs).

The initial design slung the batteries on the accessory mounting rails under the modified Tarot frames. The holder is printed from ABS plastic.

{% include blogimage src="bad_battery_holder.jpg" caption="The twin battery holders." %}

This was the first time that I ever 3d-printed drone parts, and it shows. The part looks very fragile. The first time I flew it, this happened:

{% include webm src="fail.webm" caption="First test flight. Wobbling is because the stabilizing PID controller was not yet tuned." %}

The eventual solution required building the battery holder and landing gear together. I started graduate school before I could shoot any video of the drone flying; now the drone chassis serves as a wall decoration.

{% include blogimage src="wallhanger.jpg" caption="Drone chassis as a wall decoration, next to a 90mm drone for scale." %}
