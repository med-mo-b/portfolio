# My Website - Portfolio

This is the source code repository for my personal portfolio website.
The project is based on **Bun** for fast development and optimized production builds.

## 📂 Structure

- **`src/`**: Contains the source code (HTML, JavaScript, CSS). Development happens here.
- **`public/`**: Static files (Images, CNAME), which are copied unchanged to the build.
- **`server.ts`**: Development server configuration with hot-reloading (HMR).

## 🚀 Development

Install dependencies:

```bash
bun install
```

Start the local development server:

```bash
bun run dev
```

The site will be available at `http://localhost:3000`.

## 📦 Deployment

Deployment is automated via **GitHub Actions**.

### Workflow (Git Flow)

1.  **Development (`develop`)**: All new features and changes are made in the `develop` branch.
2.  **Release (`main`)**: When the state is stable, `develop` is merged into `main` (Pull Request).
3.  **Auto-Deploy**: A push to `main` automatically triggers the build and deployment to GitHub Pages.

## 🛠 Build Scripts

- `bun run dev`: Starts the dev server with hot-reloading (HMR).
- `bun run build`: Builds the optimized version into the `dist/` folder and copies public assets.
- `bun run clean`: Removes the `dist/` folder.
- `bun run preview`: Serves the production build from the `dist/` folder (for testing).
