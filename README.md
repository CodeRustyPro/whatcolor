# Color Detection Tool



## Overview

Welcome to the Color Detection App! This project allows you to identify colors from both live camera feeds and uploaded images. Simply snap a photo, click on any part of the image or video, and find out the exact color name, including those you might not be familiar with.

## Demo
![ezgif-5-7eedad3254](https://github.com/user-attachments/assets/cf67b9b8-4362-47a8-abb6-a5cc6ec012e6)


## Features

- **Live Camera Feed:** Capture real-time colors using your webcam.
- **Image Upload:** Upload any image to analyze and detect colors.
- **Color Identification:** Get the closest matching color name from a comprehensive color database.
- **User-Friendly Interface:** Easy-to-use design with a clear display of color names and visual representation.

## How It Works

1. **Color Conversion:** The app converts colors from hexadecimal format to RGB, then to XYZ, and finally to the LAB color space to accurately determine color differences.
2. **Color Comparison:** It calculates the difference between the color you clicked on and a set of known colors using the CIE76 and CIEDE2000 color difference formulas.
3. **Color Naming:** Matches the detected color to the nearest name from a predefined list of colors or a fallback set of standard colors.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/CodeRustyPro/whatcolor.git
