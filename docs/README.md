# Using Lawn Pawn

A guide for interacting with the user interface

## Signing Up

1. Select the 'Sign Up' button in the navigation bar at the top of the screen.
2. Enter your desired username and password in the appropriate fields, and select the 'Sign Up' button below.
   - A warning will pop up if the entered username already exists.
3. Upon successful signup, you will be redirected to the login screen. Follow instructions for logging in starting at step 2.

## Logging In

1. Select the 'Login' button in the navigation bar at the top of the screen.
2. Enter your username and password in the appropriate fields, and select the 'Login' button below.
   - A warning will pop up if the entered password does not match the entered username or if the entered username does not exist.
   - See instructions for signing up if you do not already have an account.
3. Upon successful login, you will be redirected to the main page.
   - The navigation bar will now display options to delete account or log out.
4. Your account name will be shown in the left of the navigation bar, at the top of the screen.

## Deleting an Account

**Deleting your account is permanent and irreversable. All posts associated with the account will also be deleted.**

1. Ensure you are logged in.
   - See instructions for logging in if you are not already logged in.
2. Select the 'Delete Account' button in the navigation bar at the top of the screen.
3. A warning will pop up, asking if you are sure you want to delete your account.
4. Upon accepting the warning, your account and associated posts will be deleted.

## Creating a New Post

1. Ensure you are logged in.
   - See instructions for logging in if you are not already logged in.
2. Navigate to the top of the main body of the page, under 'Create a New Auction Post'
3. Add an image of the item with the 'Add an image' file picker (a default placeholder is used if you skip this).
4. Set the auction end date and time in the date-time picker.
   - The picker defaults to 24 hours in the future and will not allow a past time.
5. Enter a title for your post in the title box.
6. Write a short description of your auction in the description box.
7. Select the 'Create' button below and watch your new post show up in the posts area.
   - Posts can be found below 'Sort By' section of the page.

## Filtering Posts

1. Navigate to below the auction creation section and locate the 'Filter By' section.
2. Enter the full username of the account for which you would like to view posts in the box next to 'author:'.
   - Currently, the username entered must match the username of the account to be searched exactly.
3. Posts will be filtered to only show posts created by the entered username.

## Sorting Posts

1. Navigate to below post filtering and locate the 'Sort By' section.
2. Select the sorting method desired.
3. Posts will automatically sort based on the selected criteria.

## Viewing Auction Details

1. From the list of posts, select an auction card to open its detail page.
   - Expired auctions are marked as over and cannot be opened for bidding.
2. Review the seller name, created time, end time, and live countdown.
3. View the auction image and the full description.
4. Expand or collapse the Bid History to see previous bids and who placed them.

## Placing a Bid

1. Ensure you are logged in and have tokens available (your token balance is shown above the bid panel).
2. Enter your bid amount in tokens and select 'Place Bid'.
   - Invalid numbers or bidding while logged out will display a warning instead of placing the bid.
3. The current bid and bid history update in real time while you are on the page.
4. If the auction time expires, bidding closes automatically.

## Earning Tokens with Mow

1. Ensure you are logged in.
2. Select the 'Mow' link in the navigation bar.
3. Move your mouse to drive the mower over grass patches to collect tokens.
4. Tokens are added to your balance automatically and can be used for placing bids.

# Lawn Pawn Design Decisions

Lawn Pawn was designed to imitate a yard, being an application for yard sales.
Posts alternate colors to resemble the pattern of a freshly-mown lawn.
Logging in and signing up were placed in an easily accessible part of the navigation menu to make it easy for users to get started with making posts and interacting with the application as soon as possible.
The login and sign up buttons are replaced with account deletion and logout buttons as to not create confusion for a logged-in user.
The user should not be able to log in to two accounts at one time.
The post creation section is replaced by an message telling the user to log in first to make it clear when a user can and cannot create a post.
The user can always return to the main page by selecting 'Lawn Pawn' in the left of the navigation bar at the top of the screen.
Real-time bid updates and countdowns let bidders see changes instantly without refreshing, keeping auctions fair.
The Mow mini-game reinforces the yard theme while giving users a playful way to earn tokens for bidding.
