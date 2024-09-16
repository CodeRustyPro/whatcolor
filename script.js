const fallbackColors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Green', hex: '#00FF00' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Cyan', hex: '#00FFFF' },
    { name: 'Magenta', hex: '#FF00FF' }
    // Add more as needed
];

        const video = document.getElementById('video');
        const canvas = document.getElementById('imageCanvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const snapButton = document.getElementById('snap');
        const colorNameDisplay = document.getElementById('colorName');
        const colorBox = document.getElementById('colorBox');

        // Convert hex to RGB
        function hexToRgb(hex) {
            const bigint = parseInt(hex.slice(1), 16);
            return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
        }

        // Convert RGB to XYZ
        function rgbToXyz({ r, g, b }) {
            const rgb = [r, g, b].map(function (v) {
                v /= 255;
                return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
            });

            return {
                x: (rgb[0] * 0.4124564 + rgb[1] * 0.3575761 + rgb[2] * 0.1804375) * 100,
                y: (rgb[0] * 0.2126729 + rgb[1] * 0.7151522 + rgb[2] * 0.0721750) * 100,
                z: (rgb[0] * 0.0193339 + rgb[1] * 0.1191920 + rgb[2] * 0.9503041) * 100
            };
        }

        // Convert XYZ to Lab
        function xyzToLab({ x, y, z }) {
            const refX = 95.047, refY = 100.000, refZ = 108.883;

            const xyz = [x / refX, y / refY, z / refZ].map(function (v) {
                return v > 0.008856 ? Math.pow(v, 1 / 3) : (7.787 * v) + (16 / 116);
            });

            return {
                l: (116 * xyz[1]) - 16,
                a: 500 * (xyz[0] - xyz[1]),
                b: 200 * (xyz[1] - xyz[2])
            };
        }

        // Calculate color difference using CIE76 (ΔE)
        function deltaE(lab1, lab2) {
            return Math.sqrt(Math.pow(lab1.l - lab2.l, 2) + Math.pow(lab1.a - lab2.a, 2) + Math.pow(lab1.b - lab2.b, 2));
        }
        function deltaE00(lab1, lab2) {
    const kL = 1, kC = 1, kH = 1; // Parametric factors

    const deltaLPrime = lab2.l - lab1.l;
    const lBar = (lab1.l + lab2.l) / 2;
    const c1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
    const c2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
    const cBar = (c1 + c2) / 2;
    const aPrime1 = lab1.a + (lab1.a / 2) * (1 - Math.sqrt(Math.pow(cBar, 7) / (Math.pow(cBar, 7) + Math.pow(25, 7))));
    const aPrime2 = lab2.a + (lab2.a / 2) * (1 - Math.sqrt(Math.pow(cBar, 7) / (Math.pow(cBar, 7) + Math.pow(25, 7))));
    const cPrime1 = Math.sqrt(aPrime1 * aPrime1 + lab1.b * lab1.b);
    const cPrime2 = Math.sqrt(aPrime2 * aPrime2 + lab2.b * lab2.b);
    const cBarPrime = (cPrime1 + cPrime2) / 2;
    const deltaCPrime = cPrime2 - cPrime1;
    const hPrime1 = Math.atan2(lab1.b, aPrime1);
    const hPrime2 = Math.atan2(lab2.b, aPrime2);
    const deltaHPrime = 2 * Math.sqrt(cPrime1 * cPrime2) * Math.sin((hPrime2 - hPrime1) / 2);

    const lBarPrime = lBar;
    const cBarPrime7 = Math.pow(cBarPrime, 7);
    const t = 1 - 0.17 * Math.cos(hPrime1 + hPrime2) + 0.24 * Math.cos(2 * hPrime1) + 0.32 * Math.cos(3 * hPrime1 + hPrime2) - 0.20 * Math.cos(4 * hPrime1);
    const deltaTheta = 30 * Math.exp(-Math.pow((lBarPrime - 275) / 25, 2));
    const rC = 2 * Math.sqrt(cBarPrime7 / (cBarPrime7 + Math.pow(25, 7)));
    const sL = 1 + (0.015 * Math.pow(lBar - 50, 2)) / Math.sqrt(20 + Math.pow(lBar - 50, 2));
    const sC = 1 + 0.045 * cBarPrime;
    const sH = 1 + 0.015 * cBarPrime * t;
    const rT = -Math.sin(2 * deltaTheta) * rC;

    const deltaE00 = Math.sqrt(
        Math.pow(deltaLPrime / (kL * sL), 2) +
        Math.pow(deltaCPrime / (kC * sC), 2) +
        Math.pow(deltaHPrime / (kH * sH), 2) +
        rT * (deltaCPrime / (kC * sC)) * (deltaHPrime / (kH * sH))
    );

    return deltaE00;
}


        // Fetch color names JSON data
        async function loadColorNames() {
            try {
                const response = await fetch('https://unpkg.com/color-name-list/dist/colornames.json');
                const colorNames = await response.json();
                return colorNames;
            } catch (error) {
                console.error("Error loading color names:", error);
                return [];
            }
        }

        // Get the nearest color name
        function getNearestColorName(rgb, colorNames) {
    const rgbLab = xyzToLab(rgbToXyz(rgb));
    let nearestColor = null;
    let smallestDiff = Infinity;

    // Check main color names database
    colorNames.forEach(color => {
        const colorLab = xyzToLab(rgbToXyz(hexToRgb(color.hex)));
        const diff = deltaE(rgbLab, colorLab);

        if (diff < smallestDiff) {
            smallestDiff = diff;
            nearestColor = color;
        }
    });

    // Fallback to standard colors if not found
    if (!nearestColor) {
        smallestDiff = Infinity; // Reset for fallback comparison
        fallbackColors.forEach(color => {
            const colorLab = xyzToLab(rgbToXyz(hexToRgb(color.hex)));
            const diff = deltaE(rgbLab, colorLab);

            if (diff < smallestDiff) {
                smallestDiff = diff;
                nearestColor = color;
            }
        });
    }

    return nearestColor;
}


        // Load color names
        let colorNames = [];
        loadColorNames().then((data) => {
            colorNames = data;
        });

        // Access the user's camera
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (err) {
                console.log("Error accessing camera: " + err);
            });

        // Snap button to capture the image from the video stream
        snapButton.addEventListener("click", function () {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        });

        // Detect color on canvas click
        canvas.addEventListener("click", function (event) {
            const x = event.offsetX;
            const y = event.offsetY;
            
            const pixelData = ctx.getImageData(x, y, 1, 1).data;
            const rgb = { r: pixelData[0], g: pixelData[1], b: pixelData[2] };
            
            const nearestColor = getNearestColorName(rgb, colorNames);
            colorNameDisplay.textContent = nearestColor ? nearestColor.name : "Unknown Color";
            colorBox.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        });

        // Image upload and display on canvas
        const imageInput = document.getElementById("imageInput");
        imageInput.addEventListener("change", function (event) {
            const file = event.target.files[0];
            const img = new Image();
            const reader = new FileReader();
            
            reader.onload = function (e) {
                img.src = e.target.result;
                img.onload = function () {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                };
            };

            if (file) {
                reader.readAsDataURL(file);
            }
        });