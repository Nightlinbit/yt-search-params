# YouTube Search Params Generator

This is a short and simple Javascript file that implements various functions to aid in the generation of the YouTube search parameters, as well as various other components on their site.

## Explanation

YouTube search parameters, along with various other variables used by the site, such as continuation endpoints, work as base64-encoded Protobuf binaries. In order to synthesise our own search parameters query, we need to first reverse engineer this format. This Javascript file implements tools for generating the Protobuf binary from JSON and ultimately generating our own parameter without the need of YouTube's backend to do it for us.

This can be manually entered into a YouTube search page URL `/results?sp=YOUR_PARAMS&search_query=YOUR_QUERY`, or used for whatever other purposes you see fit.

## Usage

```js
// Returns the base64-encoded URL parameter for search params
searchParams(
  {
    // Controls the search sorting option
    "sort": (string: "relevance" | "rating" | "uploadDate" | "viewCount"),
    // Apply various filters to the results
    "filter": {
      "uploadDate": (string: "lastHour" | "today" | "thisWeek" | "thisMonth" | "thisYear"),
      "type": (string: "video" | "channel" | "playlist" | "movie"),
      "duration": (string: "short" | "medium" | "large"),
      "isHD": (bool)
      "hasSubtitles": (bool),
      "isCreativeCommons": (bool),
      "is3D": (bool),
      "isLive": (bool),
      "isPurchased": (bool),
      "is4K": (bool),
      "is360Degree": (bool),
      "hasLocation": (bool),
      "isHDR": (bool),
      "isVR180": (bool)
    },
    // Skip the first n videos (used for pagination - every 20 videos)
    "index": (int)
  }
);
```

Types should be considered strict here - although they are not strictly enforced, using the wrong type can invalidate the entire request.

Some of the properties here (`sort`, `filter.uploadDate`, `filter.type`, and `filter.duration`) are internally used as integers, so using the strings to reference them is completely optional and is implemented here as an abstraction layer.

## Example

```js
searchParams(
  {
    "sort": "viewCount",
    "filter": {
      "uploadDate": "thisMonth",
      "isHD": true
    },
    index: 20
  }
);
```

Generates an `sp` query that is sorted by view count, uploaded during this month, filtering non-HD videos, and starting at the 2nd page (skipping the first 20 videos).

## License

fuck capitalism :)  
do whatever you want
