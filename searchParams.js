function uleb128(val) {
   // simple uleb128
   // strings are awful but this works with 64-bit numbers well
   // javascript bitwise operators are 32-bit, else we'd have a good solution
   if (val < 16) return "0" + val.toString(16);
   else if (val < 256) return val.toString(16);
   
   
   var bin = val.toString(2);
   var pad = 7 - (bin.length % 7);
   if (pad !== 7) {
      bin = "0000000".substr(0, pad) + bin;
   }
   bin = "0" + bin.match(/.{7}/g).map(a => "1" + a).join("").slice(1);
   
   
   var hex = parseInt(bin, 2).toString(16);
   hex = (hex.length & 1) ? "0" + hex : hex;
   hex = hex.match(/.{2}/g); hex.reverse(); hex = hex.join("");
   
   return hex;
}

var quickPb = {
   // quick protobuf compiler with really messy code
   // enough for our needs
   compile: function (obj, fields) {
      var response = "";
      Object.keys(obj).forEach(function (key) {
         response += quickPb.compileKvPair(key, obj[key], fields);
      });
      return response.toLowerCase().replace(" ", ""); // normalise hex just in case
   },
   compileKvPair: function (key, val, fields) {
      if (!fields[key]) return "";
      var field = fields[key];
      var wireType = field[1];
      var keyHeader = quickPb.compileKey(field);
      switch (wireType) {
         case 0: // varint
            return keyHeader + quickPb.compileVarint(val);
            break;
         case 1: // double (UNIMPLEMENTED)
            break;
         case 2: // length determined
            switch (typeof val) {
               case "object":
                  return keyHeader + quickPb.compileLd( quickPb.compile(val, field[2]) );
                  break;
               case "string":
               default:
                  return keyHeader + quickPb.compileString(val);
                  break;
            }
            break;
         case 3: // group start (UNIMPLEMENTED)
         case 4: // group end (UNIMPLEMENTED)
         case 5: // float (UNIMPLEMENTED)
            break;
      }
   },
   compileKey: function (keyField) {
      var num = keyField[0];
      var wireType = keyField[1];
      return quickPb.compileVarint( quickPb.getKey(num, wireType) );
   },
   compileVarint: function (a) {
      return uleb128(+a);
   },
   compileString: function (str) {
      return quickPb.compileLd( quickPb.toHex(str) );
   },
   compileLd: function (hexString) {
      var ldLen = quickPb.getSize(hexString);
      return quickPb.compileVarint(ldLen) + hexString;
   },
   getSize: function (hexString) {
      var a = hexString.length;
      return (a + (a % 2)) / 2;
   },
   getKey: function (fieldNumber, wireType) {
      return (fieldNumber << 3) | wireType;
   },
   toHex: function (str) {
      var hex, result = "";
      for (i = 0; i < str.length; i++) {
         hex = str.charCodeAt(i).toString(16);
         result += hex;
      }
      return result;
   }
};

function searchParams(params) {
   
   // store field and wire type in an array
   const msgFields = {
      "sort": [1, 0],
      "filter": [2, 2, {
         "uploadDate": [1, 0],
         "type": [2, 0],
         "duration": [3, 0],
         "isHD": [4, 0],
         "hasSubtitles": [5, 0],
         "isCreativeCommons": [6, 0],
         "is3D": [7, 0],
         "isLive": [8, 0],
         "isPurchased": [9, 0],
         "is4K": [14, 0],
         "is360Degree": [15, 0],
         "hasLocation": [23, 0],
         "isHDR": [25, 0],
         "isVR180": [26, 0]
      }],
      "index": [9, 0],
      "something": [61, 2] // mari real :)
   };
   
   const sortEnums = {
      "relevance": 0,
      "rating": 1,
      "uploadDate": 2,
      "viewCount": 3
   };
   const uploadDateEnums = {
      "hour": 0,
      "day": 1,
      "week": 2,
      "month": 3,
      "year" : 4,
      
      "lastHour": 0,
      "today": 1,
      "thisWeek": 2,
      "thisMonth": 3,
      "thisYear": 4
   };
   const typeEnums = {
      "video": 0,
      "channel": 1,
      "playlist": 2,
      "movie": 3
   };
   const durationEnums = {
      "short": 0,
      "medium": 2,
      "long": 1
   };
   
   const b16tob64 = str => btoa(
      str.match(/\w{2}/g).map(a => String.fromCharCode( parseInt(a, 16) ) ).join("")
   );
   
   if (params.sort && typeof params.sort == "string") {
      params.sort = sortEnums[params.sort];
   }
   if (params.filter && params.filter.uploadDate && typeof params.filter.uploadDate == "string") {
      params.filter.uploadDate = uploadDateEnums[params.filter.uploadDate];
   }
   if (params.filter && params.filter.type && typeof params.filter.type == "string") {
      params.filter.type = durationEnums[params.filter.type];
   }
   if (params.filter && params.filter.duration && typeof params.filter.duration == "string") {
      params.filter.duration = durationEnums[params.filter.duration];
   }
   
   // for some reason, indexed results set some parameter (61)
   // set that just in case
   (params.index != null && !params.something) && (params["something"] = "");
   
   var response = quickPb.compile(params, msgFields);
   response = b16tob64(response);
   return response;
   
}