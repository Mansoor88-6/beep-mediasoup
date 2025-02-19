# IM & VC - Frontend :eye:

Project mainly focuses on development, testing and integration of IM & VC frontend as per figma designs

## Collaborators :technologist:

:eight_spoked_asterisk: [Waseem Javed](https://github.com/Waseem-javed)  

## Figma Designs

- [Dashboard](https://www.figma.com/design/LmX4ynOu5pN58NZjYz8DED/landing-Page?node-id=0-142&node-type=frame&t=SFVg9cUak6Zc2ORO-0)
- [Other Pages](https://www.figma.com/design/aD5DgjgcMu0iIMRFostnp1/Video?node-id=0-1&node-type=canvas&t=zQvTP7EXgfMc8CWV-0)

## Launch Project :rocket:

- Open terminal and `cd` to project directory
- Run `npm i` to install dependencies
- Run `npm start` to start the project in development mode

## Available Scripts :page_facing_up:

In the project directory, you can run:.

### 1) `npm start`

To run project in development mode

### 2) `npm test`

Launches the test runner in the interactive watch mode.

### 3) `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

### 4) `npm install`

Installs all project dependencies as stated in package.json and package-lock.json

## Conventions :green_circle:

| File/Folder :file_folder:                          | Convention :white_check_mark:                                                           |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `view` Folder                                      | camelCase e.g. emailGateway                                                             |
| `view` files (tsx, ts, css)                        | CamelCase e.g. `EmailGateway.tsx`                                                       |
| `component` Folder                                 | small casing e.g. button                                                                |
| `component` Files (tsx, ts, css)                   | small casing e.g. `button.tsx`                                                          |
| CSS, JS, Icon asset file                           | CamelCase e.g. `AuthLayout.css`, `AuthLayout.js`                                        |
| `const`, `var`, `let` naming                       | camelCase e.g. `const currentTab = 1`                                                   |
| CSS Class Names                                    | [filename-selector-name] e.g. in `AuthLayout.tsx` a selector can be `auth-layout-title` |
| Any other custom folder or files\ not listed above | camelCase e.g. `customFolder/customFile.tsx`                                            |

## Push code to repo :muscle:

- Get ticket number from JIRA
- Create branch for ticket assigned by `git checkout [ticket-number]`
- Then commit and push code to that respective branch
- Create a PR for that branch to be merged to main
- PR will be reviewed by assgined reviewer, changes might be requested
- After being approved by assgined reviewer, branch will be merged to main

## Issues :bug:

Please follow given issue template for creating issue on github. Before that, proper process which is given below should be followed to document the issue

- Test on your system if the issue persists
- Log issue to JIRA
- Create a new issue on github with the template given in `IssueTemplate.md`

## Warning
`if tailwind classess not working with antd, then apply overide classes css for antd`

## Antd Overridding

You can try the following methods in order to override antd styles if there are causing problems overriding in the normal way

### Method 1


- Assign a `className` to antd component
- Override its style in respective css file with your class, likeaso:

```tailwind classes not css
```

### Method 2

- Assign a `className` to antd component
- Override its style in respective css file with the format

```css
not css only tailwind if antd classess overide then
```

### Method 3

- If none of the above method work, inspect the element in browser, and check the complete antd class heirarchy overriding your styles. e.g. in case of overriding `.antd-selected-menu-item` instead of overriding only the required class, as seen from browser window we will write as follows:

```css
.ant-menu:not(.ant-menu-horizontal) .ant-menu-item-selected {
  antd-field: override-value;
}
```

This always makes sure styles from your files are used instead of antd.

**PLEASE REFRAIN FROM USING `!important`**\
if none of the methods work for you, please consult others

Testing DevOps Webhooks 1;
Testing DevOps Webhooks 2 (Bug);
