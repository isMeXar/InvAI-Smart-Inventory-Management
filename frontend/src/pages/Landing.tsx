import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, BarChart3, Users, Package, TrendingUp, Shield, Zap, Moon, Sun, Globe, Menu, X } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  // Handle scroll for navbar blur & active section
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const hero = document.getElementById('hero')?.offsetTop || 0;
      const features = document.getElementById('features')?.offsetTop || 0;
      const guide = document.getElementById('workflow')?.offsetTop || 0;
      const scrollY = window.scrollY + 200;

      if (scrollY >= guide) setActiveSection('guide');
      else if (scrollY >= features) setActiveSection('features');
      else setActiveSection('home');
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Package, title: "Role-Based Stock", description: "Assign responsibilities and keep stock organized and error-free." },
    { icon: BarChart3, title: "Real-Time Alerts", description: "Receive alerts when stock is low, or tasks need attention." },
    { icon: Users, title: "Team Tracking", description: "Monitor team performance and make informed HR decisions." },
    { icon: TrendingUp, title: "Order & Supplier", description: "Track orders and suppliers in one place with full overview." },
    { icon: Shield, title: "AI Insights", description: "Leverage AI for trend analysis, forecasting, and optimization." },
    { icon: Zap, title: "Analytics Dashboard", description: "Visual overview of inventory, orders, suppliers, and performance." },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden font-roboto">
      {/* Navbar */}
      <nav className="fixed top-6 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
        <div
          className={`
            max-w-7xl mx-auto flex items-center justify-between px-6 py-3
            rounded-[12px] transition-all duration-300
            ${scrolled ? 'backdrop-blur-xl shadow-xl bg-white/10 dark:bg-slate-900/70' : 'bg-transparent'}
          `}
        >
          {/* Logo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Smart InvAI</span>
          </motion.div>

          {/* Desktop Navbar */}
          <div className="hidden md:flex items-center space-x-12">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={`font-medium transition-colors duration-200 ${activeSection==='home'?'text-primary':'text-foreground'} hover:text-primary`}>
              Home
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className={`font-medium transition-colors duration-200 ${activeSection==='features'?'text-primary':'text-foreground'} hover:text-primary`}>
              Features
            </button>
            <button onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
              className={`font-medium transition-colors duration-200 ${activeSection==='guide'?'text-primary':'text-foreground'} hover:text-primary`}>
              Guide
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <Select value={language} onValueChange={(value:'en'|'de'|'fr')=>setLanguage(value)}>
              <SelectTrigger className="w-28 border-0 bg-transparent text-foreground">
                <Globe className="h-4 w-4 mr-2"/>
                <SelectValue/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="hover:bg-primary/10">
              {theme==='light'?<Moon className="h-5 w-5"/>:<Sun className="h-5 w-5"/>}
            </Button>
            {/* Mobile Hamburger */}
            <button className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors" onClick={()=>setMenuOpen(!menuOpen)}>
              {menuOpen?<X className="h-6 w-6"/>:<Menu className="h-6 w-6"/>}
            </button>
            {/* Desktop Get Started */}
            <div className="hidden md:block">
              <Button onClick={()=>navigate('/login')} className="bg-blue-500 hover:opacity-70 transition-opacity dark:bg-blue-600 dark:text-white">{t.getStarted}</Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 bg-card dark:bg-slate-900 rounded-xl shadow-lg p-4 flex flex-col space-y-3">
            <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMenuOpen(false); }} className="text-foreground hover:text-primary font-medium">Home</button>
            <button onClick={() => { document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); }} className="text-foreground hover:text-primary font-medium">Features</button>
            <button onClick={() => { document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); }} className="text-foreground hover:text-primary font-medium">Guide</button>
            <Button onClick={()=>navigate('/login')} className="bg-gradient-primary hover:opacity-90 transition-opacity mt-2">{t.getStarted}</Button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden py-48 sm:py-32 min-h-[800px] flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated blobs */}
          <motion.div className="absolute w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:bg-purple-600"
            animate={{ x:[0,100,-120,0], y:[0,-80,100,0] }} transition={{ duration:15, repeat:Infinity, repeatType:"mirror" }} style={{top:"-10%", left:"-10%"}}/>
          <motion.div className="absolute w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:bg-pink-600"
            animate={{ x:[0,-100,120,0], y:[0,80,-100,0] }} transition={{ duration:20, repeat:Infinity, repeatType:"mirror" }} style={{bottom:"-10%", right:"-10%"}}/>
          <motion.div className="absolute w-72 h-72 bg-white-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:bg-blue-700"
            animate={{ x:[0,80,-100,0], y:[0,-60,80,0] }} transition={{ duration:25, repeat:Infinity, repeatType:"mirror" }} style={{top:"30%", left:"40%"}}/>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6}} className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
            {t.smartInventory} <span className='text-blue-700'>{t.management}</span>
          </motion.h1>
          <motion.p initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.1}} className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            {t.landingSubtitle}
          </motion.p>
          <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.2}} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={()=>navigate('/login')} className={`text-lg px-8 py-3 ${theme==='dark'?'bg-white text-blue-600 hover:text-black hover:bg-blue-200':'bg-blue-500 hover:opacity-90'} transition-all`}>
              {t.getStarted} <ArrowRight className="ml-2 h-5 w-5"/>
            </Button>
            <Button size="lg" variant="outline" onClick={()=>navigate('/login')} className={`text-lg px-8 py-3 hover:bg-primary/5 ${theme==='dark'?'bg-blue-600 text-white hover:bg-blue-500':'bg-white text-blue-500 border-blue-500 hover:border-black hover:text-black'} transition-all`}>
              {t.watchDemo}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-gradient-to-br from-white-50 via-white-50 to-white-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.powerfulFeatures}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t.featuresSubtitle}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: Package, title: t.smartInventoryTracking, description: t.smartInventoryTrackingDesc },
              { icon: BarChart3, title: t.aiPoweredInsights, description: t.aiPoweredInsightsDesc },
              { icon: Users, title: t.multiUserSupport, description: t.multiUserSupportDesc },
              { icon: TrendingUp, title: t.demandForecasting, description: t.demandForecastingDesc },
              { icon: Shield, title: t.secureReliable, description: t.secureReliableDesc },
              { icon: Zap, title: t.lightningFast, description: t.lightningFastDesc },
            ].map((feature,index)=>(
              <motion.div key={feature.title} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*0.1}}>
                <Card className="h-full border-0 bg-white dark:bg-slate-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6">
                    <feature.icon className="h-12 w-12 text-primary mb-4"/>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground dark:text-slate-300">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guide / Workflow Section */}
      <section id="workflow" className="py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{t.howItWorks}</h2>
            <p className="text-xl text-muted-foreground dark:text-slate-300 max-w-2xl mx-auto">
              {t.howItWorksSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 pt-8">
            {[
              { step: "1", title: t.setupInventory, description: t.setupInventoryDesc },
              { step: "2", title: t.configureTeam, description: t.configureTeamDesc },
              { step: "3", title: t.getAIInsights, description: t.getAIInsightsDesc },
              { step: "4", title: t.demandForecasting, description: t.demandForecastingDesc },
            ].map((step) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: parseInt(step.step) * 0.2 }}
                className="text-center"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg ${theme==='dark'?'bg-blue-600 text-white':'bg-gradient-primary text-white'}`}>
                  {step.step}
                </div>
                <h3 className="text-lg sm:text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-base sm:text-base text-muted-foreground dark:text-slate-300 max-w-xs mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-500 via-white-50 to-cyan-500 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t.readyTransform}</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">{t.readySubtitle}</p>
            <Button size="lg" variant="secondary" onClick={()=>navigate('/login')} className="text-lg px-8 py-3 bg-white text-primary hover:bg-white/90 shadow-lg">
              {t.getStartedNow} <ArrowRight className="ml-2 h-5 w-5"/>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Package className="h-6 w-6 text-primary"/>
            <span className="text-lg text-white font-semibold text-foreground">Smart InvAI</span>
          </div>
          <p className="text-slate-300">{t.copyright}</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
