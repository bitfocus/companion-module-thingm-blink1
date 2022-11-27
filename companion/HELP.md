## ThinkM Blink(1) module

Install the blink1 software from https://github.com/todbot/Blink1Control2/releases on the remote machine and make sure it accepts connections (API)
Then type the IP Address in the config section.

It is also possible to connect multiple Blink1's to your local machine and select via serialnumber (again in the config section) the right one. Create multiple instances if you have more Blink1's.

> Make sure you connect the Blink1's before starting companion. You can insert the key later but will need to disable & enable the instance to reconnect to the device.

**Available commands**

- Set color to local connected Blink1
- Switch off local connected Blink1
- Set color, set color of Blink(1) to 1 color
- Set Pattern, set Blink(1) to a pattern by nameid
- Custom commands allowed, please let us know which commands you use often

**Tally**

You can let this module work as a Tally light based on a selection of a variable. You select a variable you would like to have Tally on, like `atem:pgm1_input`.
Then put a value in the `Tally on Value` box like `CAM1`. Now your Blink will turn RED when your `atem:pgm1`\_input variable hits CAM1 (so when pressing camera 1 on your ATEM mixer).

You can also compare against a variable. So if you want to know if your AUX1 has the same source as your PGM, type `atem:aux1_input` in the Tally On Value box.
