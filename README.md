# Dynamic Multi-Language CV Website

A responsive, professional CV/resume website built for GitHub Pages with complete separation of content and presentation. The website dynamically loads all content from YAML files and supports three languages: English, German, and French.

## 🚀 Features

- **Multi-language Support**: English, German, French with dynamic language switching
- **Responsive Design**: Mobile-first design that works on all devices
- **Dynamic Content Loading**: All content loaded from structured YAML files
- **SEO Optimized**: Proper meta tags, structured data, and multilingual SEO
- **Interactive Components**:
  - Career positions carousel
  - Academic achievements carousel
  - Career timeline visualization
  - Skills with progress indicators
- **Detail Pages**: Individual pages for each career position and academic achievement
- **Accessibility**: WCAG compliant with keyboard navigation support
- **GitHub Pages Ready**: Built specifically for GitHub Pages hosting

## 🎨 Design

The website uses the "Midnight Ocean" color scheme:
- Primary: `#001f3f`
- Secondary: `#003366`
- Tertiary: `#004080`
- Accent: `#0059b3`
- Highlight: `#0077e6`

## 📁 Project Structure

```
cv_project_V01/
├── _config.yml                 # Jekyll configuration
├── _data/                      # Content data files
│   ├── en/content.yml         # English content
│   ├── de/content.yml         # German content
│   └── fr/content.yml         # French content
├── _layouts/                   # Page layouts
│   ├── default.html           # Base layout
│   ├── career-detail.html     # Career position layout
│   └── education-detail.html  # Education layout
├── _includes/                  # Reusable components
│   └── seo.html              # SEO meta tags
├── _career/                    # Career position pages
├── _education/                 # Education pages
├── assets/
│   ├── css/main.css           # Stylesheet
│   ├── js/main.js             # JavaScript functionality
│   └── images/                # Logo and image files
├── index.html                  # Homepage
├── sitemap.xml                # SEO sitemap
├── robots.txt                 # Robots instructions
├── Gemfile                    # Ruby dependencies
└── README.md                  # This file
```

## 🛠️ Setup and Deployment

### Prerequisites
- Ruby and Bundler (for local development)
- Git
- GitHub account

### Local Development

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd cv_project_V01
   ```

2. **Install dependencies**:
   ```bash
   bundle install
   ```

3. **Start local server**:
   ```bash
   bundle exec jekyll serve
   ```

4. **View website**: Open `http://localhost:4000` in your browser

### GitHub Pages Deployment

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch
   - Click "Save"

3. **Access website**: Your site will be available at `https://yourusername.github.io/repository-name/`

## 📝 Content Management

### Updating Content

All website content is stored in YAML files located in the `_data` folder:

- `_data/en/content.yml` - English content
- `_data/de/content.yml` - German content
- `_data/fr/content.yml` - French content

### YAML Structure

The YAML files contain the following sections:

#### Slogan and Introduction
```yaml
slogan:
  latin: "Ad fiduciam per factum"
  translation: "Trust thru results"

intro:
  text: |
    Your introduction text here...
```

#### Career Positions
```yaml
career_positions:
  - id: "unique-position-id"
    company: "Company Name"
    location: "City"
    position: "Job Title"
    start_date: "Month Year"
    end_date: "Month Year"
    current: true/false
    duration: "Month Year - Month Year"
    logo: "/assets/images/company-logo.png"
    summary: "Brief position summary"
    responsibilities:
      - "Responsibility 1"
      - "Responsibility 2"
    achievements:
      - "Achievement 1"
      - "Achievement 2"
    team_size: 10
    revenue_responsibility: "100M €"
```

#### Academic Achievements
```yaml
academic_achievements:
  - id: "unique-achievement-id"
    institution: "Institution Name"
    location: "City, Country"
    degree_type: "Degree Type"
    course_title: "Course/Program Name"
    start_date: "Year"
    end_date: "Year"
    duration: "Year"
    grade: "Grade/GPA"
    logo: "/assets/images/institution-logo.png"
    description: "Description of the program"
```

#### Skills
```yaml
skills:
  management:
    - name: "Skill Name"
      level: 9
      category: "management"
  it:
    - name: "Technical Skill"
      level: 8
      category: "it"
  languages:
    - name: "Language"
      level: 10
      note: "Native/Fluent/etc"
      category: "languages"
```

### Adding New Career Positions

1. **Update YAML data**: Add new position to `career_positions` section in all language files
2. **Create detail page**: Add new markdown file in `_career/` folder:
   ```markdown
   ---
   layout: career-detail
   title: "Position Title at Company"
   company: "Company Name"
   position: "Position Title"
   start_date: "Month Year"
   end_date: "Month Year"
   location: "City"
   permalink: /career/unique-id/
   ---
   ```

### Adding New Academic Achievements

1. **Update YAML data**: Add new achievement to `academic_achievements` section
2. **Create detail page**: Add new markdown file in `_education/` folder:
   ```markdown
   ---
   layout: education-detail
   title: "Degree at Institution"
   institution: "Institution Name"
   degree_type: "Degree Type"
   course_title: "Program Name"
   end_date: "Year"
   location: "City"
   permalink: /education/unique-id/
   ---
   ```

### Images and Logos

1. **Add image files** to `assets/images/`
2. **Reference in YAML** using path: `/assets/images/filename.png`
3. **Recommended formats**: PNG, JPG, SVG
4. **Recommended sizes**:
   - Company logos: 80x80px or SVG
   - Institution logos: 80x80px or SVG

## 🌐 Multi-Language Support

### Language Switching
The website automatically:
- Detects browser language preference
- Saves user language choice in localStorage
- Updates all content dynamically
- Maintains language preference across pages

### Adding New Languages

1. **Create new YAML file**: `_data/[language-code]/content.yml`
2. **Translate all content** maintaining the same structure
3. **Update JavaScript**: Add language code to supported languages array
4. **Add language button**: Update language selector in `_layouts/default.html`

## 🔧 Customization

### Colors
Update CSS custom properties in `assets/css/main.css`:
```css
:root {
    --primary: #001f3f;
    --secondary: #003366;
    /* ... other colors */
}
```

### Typography
The website uses Inter font from Google Fonts. To change:
1. Update font links in `_layouts/default.html`
2. Update `--font-family` in CSS

### Layout
- Modify `_layouts/default.html` for overall page structure
- Update individual section templates in `index.html`
- Customize detail page layouts in `_layouts/career-detail.html` and `_layouts/education-detail.html`

## 🎯 SEO Features

- Structured data (JSON-LD) for person and organization schemas
- Multi-language hreflang tags
- Open Graph and Twitter Card meta tags
- Semantic HTML structure
- Optimized page titles and descriptions
- XML sitemap generation
- Robots.txt configuration

## ♿ Accessibility Features

- WCAG 2.1 compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Focus indicators
- Semantic HTML structure
- Alternative text for images

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## ⚡ Performance Features

- Lazy loading for images
- CSS and JS minification ready
- Optimized font loading
- Efficient carousel implementation
- Cached content loading
- Minimal JavaScript dependencies

## 🐛 Troubleshooting

### Common Issues

1. **Content not updating**: Clear browser cache and check YAML syntax
2. **Images not loading**: Verify image paths and file extensions
3. **Language switching not working**: Check JavaScript console for errors
4. **Layout issues on mobile**: Test with browser dev tools responsive mode

### YAML Validation
Use online YAML validators to check syntax before committing changes.

### Local Testing
Always test changes locally before deploying to GitHub Pages.

## 📄 License

This project is available under the MIT License. See LICENSE file for details.

## 🤝 Contributing

Feel free to submit issues and pull requests for improvements.

## 📞 Support

For questions about the website structure or customization, refer to:
- Jekyll documentation: https://jekyllrb.com/docs/
- GitHub Pages documentation: https://docs.github.com/en/pages

---

Built with ❤️ using Jekyll and GitHub Pages