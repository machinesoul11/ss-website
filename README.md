# Silent Scribe Website

Privacy-first landing page and beta program infrastructure for Silent Scribe - the local, AI-powered writing assistant.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ss-website
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your actual values:
   - Supabase project URL and keys
   - SendGrid API key
   - Plausible domain (if using analytics)

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   ├── forms/       # Form components
│   ├── layout/      # Layout components
│   └── marketing/   # Marketing-specific components
├── lib/             # Utility functions and configurations
└── types/           # TypeScript type definitions
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### Code Quality

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Tailwind CSS** for styling

### Git Hooks

Run formatting and linting before committing:

```bash
npm run format && npm run lint:fix
```

## 🔧 Configuration

### Environment Variables

| Variable                        | Description                    | Required |
| ------------------------------- | ------------------------------ | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL           | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key         | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key      | Yes      |
| `SENDGRID_API_KEY`              | SendGrid API key for emails    | Yes      |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`  | Domain for Plausible analytics | No       |

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase
- **Email**: SendGrid
- **Forms**: React Hook Form + Zod
- **UI Components**: Headless UI + Heroicons
- **Animations**: Framer Motion
- **Analytics**: Plausible (privacy-first)
- **Deployment**: Vercel

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Make sure to set all required environment variables in your deployment platform:

- Supabase configuration
- SendGrid API key
- Any other service keys

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 🔒 Privacy & Security

This project prioritizes user privacy:

- Local processing architecture
- Minimal data collection
- Privacy-compliant analytics
- Transparent data practices

## 📞 Support

For questions or issues:

- Create an issue in this repository
- Contact the development team
- Check the documentation

## 📄 License

[Add your license information here]
