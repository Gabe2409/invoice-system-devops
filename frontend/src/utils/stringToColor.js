function stringToColor(string) {
    let hash = 0;
    let i;
  
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
  
    let color = "#";
  
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
  
    return color;
  }
  
function stringAvatar(name) {
  if (!name) return { sx: { bgcolor: "gray", fontSize: 14 }, children: "U" }; 

  const nameParts = name.split(" ");
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : `${nameParts[0][0]}`;

  return {
    sx: {
      bgcolor: stringToColor(name),
      fontSize: 12, 
      width: 30,
      height: 30,
    },
    children: initials.toUpperCase(),
  };
}


export default stringAvatar;