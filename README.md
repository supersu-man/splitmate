# Splitmate

Splitmate is a simple, lightweight trip expense splitter that helps groups fairly divide shared costs. Add members, track expenses, and instantly see who overpaid, who owes money, and how to settle up — all stored securely in your browser using Local Storage.

No login.
No backend.
Just fast, private, offline expense management.

## Features

🔐 Zero Authentication
- No sign-in or accounts
- 100% offline — data stays on your device

🧾 Manage Groups
- Create and delete multiple groups
- Each group stores its own members and expenses

👥 Members
- Add and remove members
- Automatically calculates per-member share
- Exclusion support: exclude members from specific expenses

💸 Expenses
- Add / edit / delete expenses
- Track expense contributors
- Real-time balance calculations

📊 Statistics

- Instantly view:
    - Who overpaid
    - Who underpaid
    - Final settlement amounts

🔒 Local Storage Based

- All data stored locally in your browser
- No cloud, backend, or external APIs
- Works offline


## Tech Stack

![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)


## Installation & Setup

1. Clone the repository
```
git clone https://github.com/supersu-man/splitmate.git
cd splitmate
```

2. Install dependencies
```
npm install
```
3. Run the development server
```
ng serve
```
4. Build for production
```
ng build --configuration production
```

## Testing

Install dependencies with `npm install --legacy-peer-deps`, then run `npm test`.
Tests use Angular's Vitest runner with jsdom and run once by default. For watch
mode, run `npm test -- --watch`.

Component generation now includes a `.spec.ts` file automatically. Existing
specs cover components only, and test discovery is limited to component specs.
The Test GitHub Actions workflow runs the unit tests before building the app.

After installing the new test dependencies, commit the updated `package-lock.json`.
The workflow currently uses `npm install --legacy-peer-deps`; once the lockfile
is refreshed, this can return to `npm ci --legacy-peer-deps`.

## Contributing
Contributions, bug reports, and feature requests are welcome!
Feel free to open an issue or submit a pull request.