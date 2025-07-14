# AIUX - AI-Powered Website Analysis Platform

AIUX is a cutting-edge platform that uses AI to analyze websites and provide comprehensive UX insights, design feedback, and actionable recommendations for improvement.

## 🚀 Features

- **AI-Powered Analysis**: Advanced AI algorithms analyze website design, usability, accessibility, and performance
- **Comprehensive Insights**: Get detailed breakdowns of UX scores across multiple categories
- **Actionable Recommendations**: Receive specific, implementable suggestions for improvement
- **Real-time Analysis**: Fast, efficient analysis with detailed results
- **Beautiful UI**: Modern, responsive design with intuitive user experience

## 🎯 What AIUX Analyzes

### Accessibility (♿)
- Color contrast ratios
- Screen reader compatibility
- Keyboard navigation
- Alt text for images
- WCAG compliance

### Performance (⚡)
- Page load times
- Image optimization
- Code efficiency
- Resource optimization
- Core Web Vitals

### Usability (🎯)
- User flow analysis
- Navigation structure
- Call-to-action placement
- Content organization
- Mobile responsiveness

### Design (🎨)
- Visual hierarchy
- Typography
- Color scheme
- Layout consistency
- Brand alignment

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: [Future: Integration with AI services for real analysis]

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AIUX
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Usage

1. **Enter Website URL**: Input the URL of the website you want to analyze
2. **Start Analysis**: Click "Analyze Website" to begin the AI-powered analysis
3. **Review Results**: Get comprehensive insights including:
   - Overall UX score
   - Detailed breakdown by category
   - Strengths and areas for improvement
   - Specific recommendations

## 🚀 Production Deployment

### Environment Setup

1. Copy the environment template:
```bash
cp env.example .env.local
```

2. Configure your environment variables:
   - For enhanced AI analysis: Set up Azure OpenAI credentials
   - For basic analysis: Leave AI credentials empty (uses mock analysis)

### Deployment Options

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

#### Netlify
```bash
npm run build
# Deploy the .next folder to Netlify
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

- `AZURE_OPENAI_API_KEY`: Your Azure OpenAI API key
- `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI endpoint
- `AZURE_OPENAI_DEPLOYMENT_NAME`: Your deployment name
- `NEXT_PUBLIC_APP_URL`: Your production URL

## 🔧 Development

### Project Structure
```
AIUX/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze-website/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AnalysisDetails.tsx
│   │   ├── Footer.tsx
│   │   └── Header.tsx
│   ├── constants/
│   │   └── colors.ts
│   └── types/
│       └── analysis.ts
├── public/
└── package.json
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Design System

The platform uses a custom color palette defined in `src/constants/colors.ts`:

- **Deep Sea**: #2000B1 (Primary blue)
- **Dark Royalty**: #02066F (Secondary blue)
- **Kimchi**: #ED4B00 (Accent orange)
- **Anti Flash White**: #F2F3F4 (Light background)
- **Lace Cap**: #EBEAED (Secondary background)

## ✅ Production Checklist

Before deploying to production, ensure you have:

- [x] **Environment Variables**: Configure `.env.local` with your settings
- [x] **AI Configuration**: Set up Azure OpenAI or leave empty for mock analysis
- [x] **Domain Configuration**: Update `NEXT_PUBLIC_APP_URL` in environment
- [x] **Security**: Review and configure security headers in `next.config.ts`
- [x] **Performance**: Build passes with optimizations enabled
- [x] **Error Handling**: Error boundaries implemented
- [x] **Docker**: Container configuration ready (optional)
- [x] **Monitoring**: Set up error tracking and analytics (optional)

## 🔮 Future Enhancements

- [ ] Real AI integration for actual website analysis
- [ ] Screenshot capture and visual analysis
- [ ] Performance metrics from real browsers
- [ ] Accessibility testing with automated tools
- [ ] Export reports to PDF
- [ ] User accounts and analysis history
- [ ] Comparison between multiple websites
- [ ] A/B testing recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@aiux.com or create an issue in the repository.

---

**AIUX** - Transforming website analysis with AI-powered insights 🚀
