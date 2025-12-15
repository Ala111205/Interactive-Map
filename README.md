**📝 Interactive Leaflet Map with Category & Place Search**

      A modern interactive map application allowing users to explore locations, filter by categories (Park, Monument, Palace, Seaside, Religious, Fort), search places globally, and discover points of interest (POIs) within selected locations — featuring live keyword search, category filters, marker clustering, geolocation, and responsive map interactions.

**Repository Link:**  https://ala111205.github.io/Interactive-Map/

**🚀 Features:**

**🔹 Core Map Features**

      🗺️ Interactive Leaflet map with panning, zooming, and min/max bounds

      📍 Locations rendered as markers with category-specific icons

      🧩 Marker clustering for better visualization of dense locations

      🌐 Full-screen map with responsive design for desktop and mobile

      📌 Clickable markers with popups showing name and category

      📍 Locate current user via geolocation and add marker for “You are here”

**🔹 Search & Filter Features**

      🔎 Live keyword search with debouncing to reduce unnecessary requests

      🧩 Category filtering for Parks, Monuments, Palaces, Seaside spots, Religious sites, and Forts

      🌍 Remote search using OpenStreetMap Nominatim for places and POIs

      ⚡ Progressive rendering: shows markers immediately as results arrive

      🧹 Clear filter option resets the map and local markers instantly

      🔁 Seamless switching between categories or new place searches without page reload

      🧠 Duplicate removal to avoid repeated markers (important for overlapping POIs like Seaside keywords)

**🔹 Additional Features**

      🌊 POI discovery inside selected places (e.g., all parks inside Chennai)

      🖼️ Category-specific marker icons for intuitive visualization

      ⚡ Optimized network requests with token-based cancellation to avoid showing outdated results

      🖱️ Clicking markers displays interactive popups with place details

      ⏱️ Instant feedback on searches, even when waiting for remote API results

**⚙️ Tech Stack:**

**🖥️ Frontend**

      HTML5 & CSS3 – responsive layout and map container styling

      JavaScript (ES6 Modules) – modular, maintainable, async search logic

      Leaflet.js – map rendering, markers, clustering, popups, and zoom control

      OpenStreetMap + Nominatim – live remote place and POI search

      LocalStorage – optional storage of search state or map preferences

      Debounce & token-based cancellation – smooth input handling and progressive rendering
