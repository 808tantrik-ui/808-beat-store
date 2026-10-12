/**
 * 808 BEAT STORE - GOOGLE DRIVE 1-CLICK BATCH RENAMER
 * 
 * Paste this into Google Apps Script (https://script.google.com) and click "Run"
 * to instantly rename all 20 beat files in your Google Drive folder
 * to their exact SEO-optimized titles!
 */

function renameAllBeats() {
  var fileRenameMap = {
    "1Nx2feguZ5BC5nZz3zy_4GOfUO00Cjuu9": "[FREE] BLACKOUT - Dark Trap Type Beat (104 BPM - G Minor) Prod by 808 Beat Store.wav",
    "19La1RTJFt1wJYSzwIqDjEr0vd6MwEYgp": "[FREE] BREAK THE WALL - Drill Type Beat (100 BPM - F# Minor) Prod by 808 Beat Store.wav",
    "1kdvHygHQojH2rXm4M8ks5Lnegfh1zCHu": "[FREE] BROKEN FRAME 31 - Melodic Beat (77 BPM - C Major) Prod by 808 Beat Store.wav",
    "1Ej660uhXWZ3bdxrcZ3scEcFgivoA4ZXM": "[FREE] BROKEN FRAME 31-1 - Sad Beat (75 BPM - G# Major) Prod by 808 Beat Store.wav",
    "1dQVvbdys_KLWvhEcYEzq50-uFJmbqQk9": "[FREE] COLD GOODBYE - Hip Hop Beat (86 BPM - B Major) Prod by 808 Beat Store.wav",
    "1jGd3kP8Gj1syV1-ChwzqdzrUX61XbY91": "[FREE] DEAD SILENCE - Dark Drill Beat (85 BPM - C Minor) Prod by 808 Beat Store.wav",
    "1ogALzW2D3VE-fWnSnqBzah8VGQj5hZMM": "[FREE] EMPTY ROOM - Soulful Boombap (80 BPM - C# Major) Prod by 808 Beat Store.wav",
    "1Lx9Du1Hixla2BapNz8jM3Nrqf-JPDnar": "[FREE] FADING LIGHTS - Ambient Trap (76 BPM - F Major) Prod by 808 Beat Store.wav",
    "19wTc0sA8P4MvPMujVLt7M9RGseuFZsB0": "[FREE] FAULT LINE - Heavy 808 Trap Beat (91 BPM - F Minor) Prod by 808 Beat Store.wav",
    "1lXj4O8VGZkHTwrkPZxFfPHJ7rd7W6DEp": "[FREE] FURY ROAD - Rage Hip Hop Beat (105 BPM - F Minor) Prod by 808 Beat Store.wav",
    "1XrM77L8XyL-aP0aT5LKJomUv1uq7PJoi": "[FREE] GREED & GLORY - Boom Bap Beat (90 BPM - D# Minor) Prod by 808 Beat Store.wav",
    "18jy4zE_l_t9xLaTDGAstA_Ld9rM_ZLc7": "[FREE] GULLY FREESTYLE - 808 Gully Beat (95 BPM - F Minor) Prod by 808 Beat Store.wav",
    "11XblferL3ZVYc9f7HJA6XmMsnemTZDt_": "[FREE] IRON GATE - Gritty Boombap (75 BPM - D Minor) Prod by 808 Beat Store.wav",
    "1rDCgvYAGAjlU7bQxUyyNjFwjcysjtHXf": "[FREE] NO REPLY - Melodic Sad Trap (78 BPM - G Major) Prod by 808 Beat Store.wav",
    "1L6ZLasPSvwJu_NZgQLFf96p3gsYlqMK6": "[FREE] RAINY NIGHTS - Lofi Hip Hop Beat (80 BPM - F Major) Prod by 808 Beat Store.wav",
    "11JpP1a6KDZhWi3WugSpK6jkrXWnHgf2E": "[FREE] RIOT CALL - High Energy Drill (105 BPM - D Minor) Prod by 808 Beat Store.wav",
    "1fx5gOQko9L_6KEoiEy-BzZsQcMqfKGgh": "[FREE] STEEL NERVE - Dark Trap Beat (90 BPM - G Minor) Prod by 808 Beat Store.wav",
    "10sRx9aikdFNSkGcYZA7PF3ENrpvDJWBW": "[FREE] STILL HURTS - Guitar Trap Beat (85 BPM - C Minor) Prod by 808 Beat Store.wav",
    "1OrWUGxzUCOwaiqCtfEsyUIC1z_4wYAGZ": "[FREE] TURN PAGE - Storytelling Beat (74 BPM - F# Minor) Prod by 808 Beat Store.wav",
    "1htV9sjV88px98iEn4CSVnZQFzTBekxtb": "[FREE] WINTER HURT - Ambient Cold Beat (78 BPM - C# Minor) Prod by 808 Beat Store.wav"
  };

  for (var fileId in fileRenameMap) {
    try {
      var file = DriveApp.getFileById(fileId);
      var oldName = file.getName();
      var newName = fileRenameMap[fileId];
      file.setName(newName);
      Logger.log("✅ Renamed: " + oldName + " ---> " + newName);
    } catch (e) {
      Logger.log("⚠️ Error renaming " + fileId + ": " + e.message);
    }
  }
  Logger.log("🎉 All 20 files successfully renamed in Google Drive!");
}
