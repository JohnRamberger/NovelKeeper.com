# [NovelKeeper.com](https://www.novelkeeper.com) [INACTIVE]
### Your all-in-one place to collect and read novels.
NovelKeeper is the ultimate library for online novels. Simply add a novel and start reading.
 
Novelkeeper.com uses backend PHP to scrape novel content from other novel sites, while using JS to conveniently organize and display all your novels in one place. 
Note: NovelKeeper.com is free to use and is a personal learning project. 

## How to use NovelKeeper.com?
### Step 1. Find a Novel
NovelKeeper supports tens of online sites to grab novels from. Just copy the url and you're good to go.

### Step 2. Add Novel
Paste the url of the novel into the addnovel page, and we'll do the rest.

### Step 3. Read
Save novels to your library with 1-click. NovelKeeper will track your reading progress automatically, saving you time and hassle.

## What is NovelKeeper.com?
 NovelKeeper.com is a free-to-use novel library website developed for the sole purpose of making webnovels and lightnovels easier to read. Instead of manually checking each novel on each different platform, NovelKeeper.com does all the work for you, and better. NovelKeeper.com uses only the novel's URL and the current chapter URL to scrape all of the data from other novel sites. Simply add your novel using the novel's URL, and NovelKeeper.com will do the rest by grabbing all of the novel's metadata and content. NovelKeeper.com also checks for new chapters everytime the page reloads, so simply reload the page to get the current updates on your library of novels. Novel sites all have their own reader with a different stlye, some good some bad. NovelKeeper.com allows you to coustomize a reader that works for all your favorite novels, with multiple themes, fonts, font sizes, scrolling behavior and more. 
 
 ## Why make NovelKeeper.com when other novel reading sites exist?
 While other novel sites exist such as [novelfull.com](https://www.novelfull.com), they never have all of the novels I'd like to read (forcing me to use multiple sites). This makes tracking a nightmare in the sense that I have to keep track of each novel on each different platform while also checking each one separately for updates (webnovels often release new chapters daily/weekly/monthly). Also, when using many different novel sites, each has their own reader which can be good or bad. 
 
 ## What have I gained from creating NovelKeeper.com
 With NovelKeeper.com, I aspired to include functionality above all else. I wanted everything to work perfectly and efficiently, and I can say that it has come close to these expectations. I also wanted to learn more about not only web development and database integration, but also UX. Compared to my previous web developments, NovelKeeper.com is leaps and bounds more advanced. I created a logo svg along with different themes and animations that enhance the user experience, while also using a SQLite database to manage all the data being used on the site. Similar to my other sites, you can sign in through Google OAuth and seamlessly connect to the site. I also attempted to integrate metadata into the web pages. Not only SEO stuff, but also tags for UX such as the theme tag that updates whenever the theme of the reader page changes, changing the color theme of mobile browsers. 
 
 ## How does NovelKeeper.com work?
 ### TLDR
 Novelkeeper.com takes the URL of the novel provided and "grabs" the HTML content of the page containing the novel. Using a "map" of the page, NovelKeeper.com grabs all of the relevant information for the novel such as the title, author, tags, cover image, chapter URLs, and the chapter's content. While this may seem like a lengthy process, only the scraping of the website takes "real" time, while all the other data is grabbed through fast JavaScript methods. The speed of the scrape is dependent on the load time of the original site, so faster webpages will load faster on NovelKeeper.com. Only a few items are saved in the NovelKeeper.com database to maximize loading effiency: the novel's title, URL, cover image, current chapter URL and current chapter index. Everything else, such as the chapter content is loaded every time in order to facilitate updates and changes ion the original page. 
