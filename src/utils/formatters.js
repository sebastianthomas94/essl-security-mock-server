import fs from 'fs';

/**
 * Simple function to convert JSON file to ESSL device format
 * @param {string} jsonFilePath - Path to the JSON file
 * @returns {Array} Array of formatted strings
 */
function convertJsonToDeviceFormat(jsonFilePath) {
  try {
    // Read the JSON file
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const users = JSON.parse(jsonData);
    
    // Convert each user to the device format
    const formattedUsers = users.map(user => {
      return `PIN=${user.PIN}\tName=${user.Name}\tPri=${user.Pri || user.Privilege || 0}\tPasswd=${user.Password || user.Passwd || ""}\tCard=${user.Card || ""}\tGrp=${user.Group || user.Grp || ""}\tTZ=${user.TZ || ""}`;
    });
    
    return formattedUsers;
  } catch (error) {
    throw new Error(`Failed to convert JSON file: ${error.message}`);
  }
}

export {
  convertJsonToDeviceFormat
};