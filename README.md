# My Website - Portfolio

This is the source code repository for my personal portfolio website.
The project is based on **Vite** for fast development and optimized production builds.

## 📂 Structure

- **`src/`**: Contains the source code (HTML, JavaScript, CSS). Development happens here.
- **`public/`**: Static files (Images, CNAME), which are copied unchanged to the build.
- **`vite.config.js`**: Configuration file for Vite.

## 🚀 Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

The site will be available at `http://localhost:5173`.

## 📦 Deployment

Deployment is automated via **GitHub Actions**.

### Workflow (Git Flow)

1.  **Development (`develop`)**: All new features and changes are made in the `develop` branch.
2.  **Release (`main`)**: When the state is stable, `develop` is merged into `main` (Pull Request).
3.  **Auto-Deploy**: A push to `main` automatically triggers the build and deployment to GitHub Pages.

## 🛠 Build Scripts

- `npm run dev`: Starts the dev server with hot-reloading.
- `npm run build`: Builds the optimized version into the `dist/` folder.
- `npm run preview`: Starts a local web server for the production build (for testing).
