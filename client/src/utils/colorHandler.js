export function generateShipToColors(data) {
  // Generate random bright color using HSL
  const generateBrightColor = () => {
    const hue = Math.floor(Math.random() * 360);      // Random color
    const saturation = 90 + Math.random() * 10;      // 90–100%
    const lightness = 45 + Math.random() * 15;       // 45–60%
    return `hsl(${hue}, ${saturation}%, ${lightness}%, 30%)`;
  };

  // Convert HSL to RGB for brightness check
  const hslToRgb = (h, s, l) => {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
  };

  // Choose best text color based on contrast
  const getContrastText = (hsl) => {
    const [h, s, l] = hsl
      .match(/\d+/g)
      .map(Number);
    const [r, g, b] = hslToRgb(h, s, l);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150 ? "#111" : "#fff"; // dark or white text
  };

  const colorMap = {};
  data.forEach(item => {
    if (item.shipTo && !colorMap[item.shipTo._id]) {
      const bg = generateBrightColor();
      colorMap[item.shipTo._id] = {
        shipToId: item.shipTo._id,
        backgroundColor: bg,
        foregroundColor: getContrastText(bg)
      };
    }
  });

  return Object.values(colorMap);
}
