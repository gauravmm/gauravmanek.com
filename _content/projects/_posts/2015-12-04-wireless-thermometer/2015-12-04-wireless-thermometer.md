---
title: Wireless Cooking Thermometer
subtitle: A cooking thermometer with hands-free control, temperature alarms, and more.
---

I like to cook. Sometimes food, sometimes chocolate, sometimes even candy. Some of my favorite recipes, like caramel truffles, require very close control of the temperature. A consistent problem faced in the kitchen is that of accurate and continuous temperature monitoring. This project fills that need: it is a device that can monitor the temperature of food and candy as it is being cooked. 

It was completed in Fall 2016, for academic credit in Brown University.

# Features

Here's [the final report](/download/WirelessCookingThermometer.pdf), summarizing the features and providing some technical details. 

## Temperature Display

{% include webm src="temp_display.webm" %}

It comes in two parts, a base station and a wireless probe. The wireless probe can be hooked onto the side of a cooking vessel, and the sensors will measure the temperature of the item directly. 

The separate base has a screen, a buzzer, and touch-free user interaction. This base station will display the current temperature, show on demand a graph of the temperature over time, and provide a temperature alarm that rings when the temperature goes above or below a user-settable threshold. When the alarm is triggered, the wireless probe’s LED flashes.

(The original design called for an infrared temperature sensor, which would support much higher temperatures. Unfortunately, due to shipping delays, that was not used in the final project.)

## Touch-free Interaction

{% include webm src="interaction.webm" %}

There is a distance sensor and microphone in the base station to allow for touch-free user interaction. To get the attention of the system, you just need to bring your hand close to the system. Once detected, the menu is displayed and moving your hand changes the highlighted option. You can select an option by clicking your fingers, or move your hand away to cancel.

## Alarm

{% include webm src="set_alarm.webm" %}

Some recipes -- especially those involving chocolate and sugar -- call for precise temperature control. To support this, the cooking thermometer allows you to set an alarm. When the food reaches that temperature, the indicator LED blinks red and a buzzer sounds. The alarm is set through the touch-free menu.

## Graphing

{% include webm src="graph.webm" %}

The thermometer also graphs the temperature, with an automatically-scaling y-axis.

# Conclusion

From this point, further work in power management and PCB design are needed. Also, switching to the IR thermocouple would allow us to consolidate all the electronics into a single package, which would greatly simplify the circuit design.

There are more details available in [the final project report](/download/WirelessCookingThermometer.pdf).