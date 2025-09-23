import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Badge } from 'react-bootstrap';
import { 
  Truck, 
  GraphUp, 
  ShieldCheck, 
  Clock,
  People,
  GeoAlt,
  CashCoin,
  Droplet,
  ClipboardData,
  Building,
  CheckCircle,
  BoxSeam,
  Calculator,
  BarChartLine,
  CurrencyDollar,
  ClipboardCheck,
  PiggyBank
} from 'react-bootstrap-icons';
import { motion } from 'framer-motion';
import './css/WelcomePage.css';
import { useNavigate } from 'react-router-dom';

const WelcomePage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
const navigate= useNavigate()
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Droplet size={40} />,
      title: "Milk Collection",
      description: "Efficient collection from farmers with real-time quality testing",
      color: "#4CAF50"
    },
    {
      icon: <ShieldCheck size={40} />,
      title: "Quality Assurance",
      description: "Comprehensive quality metrics tracking and analysis",
      color: "#2196F3"
    },
    {
      icon: <BoxSeam size={40} />,
      title: "Inventory Management",
      description: "Track milk stock, equipment, and supplies in real-time",
      color: "#FF6B35"
    },
    {
      icon: <Calculator size={40} />,
      title: "Financial Management",
      description: "Automated payments, expense tracking, and profit analysis",
      color: "#00B894"
    },
    {
      icon: <GraphUp size={40} />,
      title: "Supply Chain Tracking",
      description: "End-to-end visibility from farm to processing plant",
      color: "#FF9800"
    },
    {
      icon: <Truck size={40} />,
      title: "Logistics Management",
      description: "Optimized transportation and batch management",
      color: "#9C27B0"
    }
  ];

  const farmerBenefits = [
    {
      icon: <BarChartLine size={30} />,
      title: "Smart Inventory",
      description: "Automated stock tracking for milk, feed, and supplies with low-stock alerts"
    },
    {
      icon: <CurrencyDollar size={30} />,
      title: "Financial Insights",
      description: "Real-time revenue tracking, expense management, and profit analysis"
    },
    {
      icon: <ClipboardCheck size={30} />,
      title: "Production Planning",
      description: "Optimize milk production based on demand and inventory levels"
    },
    {
      icon: <PiggyBank size={30} />,
      title: "Cost Optimization",
      description: "Reduce waste and maximize profits with intelligent analytics"
    }
  ];

  const stats = [
    { value: "1000+", label: "Farmers Connected", icon: <People /> },
    { value: "50+", label: "Collection Centers", icon: <Building /> },
    { value: "24/7", label: "Real-time Tracking", icon: <Clock /> },
    { value: "35%", label: "Cost Reduction", icon: <Calculator /> },
    { value: "99.8%", label: "Quality Compliance", icon: <CheckCircle /> },
    { value: "2.5x", label: "Profit Increase", icon: <CashCoin /> }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Farmer Registration & Setup",
      description: "Complete profile setup with inventory and financial preferences",
      icon: "👨‍🌾"
    },
    {
      step: 2,
      title: "Daily Milk Collection",
      description: "Quality-tested collection with automatic inventory updates",
      icon: "🥛"
    },
    {
      step: 3,
      title: "Inventory Management",
      description: "Real-time stock tracking and automated replenishment alerts",
      icon: "📊"
    },
    {
      step: 4,
      title: "Financial Processing",
      description: "Automated payments, expense tracking, and profit calculation",
      icon: "💳"
    },
    {
      step: 5,
      title: "Analytics & Reporting",
      description: "Comprehensive reports on production, inventory, and finances",
      icon: "📈"
    },
    {
      step: 6,
      title: "Supply Chain Integration",
      description: "Seamless coordination with collection centers and buyers",
      icon: "🔗"
    }
  ];

  const financialFeatures = [
    {
      metric: "Automated Payments",
      value: "Instant settlement",
      icon: "⚡"
    },
    {
      metric: "Expense Tracking",
      value: "Real-time monitoring",
      icon: "📋"
    },
    {
      metric: "Profit Analysis",
      value: "Daily insights",
      icon: "💹"
    },
    {
      metric: "Tax Ready Reports",
      value: "Exportable formats",
      icon: "📄"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="welcome-page"
    >
      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6}>
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Badge bg="light" text="dark" className="mb-3">
                  🚀 Complete Dairy Management Suite
                </Badge>
                <h1 className="display-4 fw-bold mb-4">
                  Smart Farming,
                  <span className="text-primary"> Smart Business</span>
                </h1>
                <p className="lead mb-4">
                  The all-in-one platform that revolutionizes dairy farming with comprehensive 
                  inventory management, financial tracking, and supply chain optimization. 
                  Maximize your profits while minimizing effort.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={navigate('/login')}
                    className="px-4 py-2"
                  >
                    Start Managing Smartly
                  </Button>
                  <Button 
                    variant="outline-light" 
                    size="lg"
                    className="px-4 py-2"
                  >
                    See Farmer Success Stories
                  </Button>
                </div>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center"
              >
                <div className="farm-management-animation">
                  <div className="animation-container">
                    <div className="animation-row">
                      <div className="animated-element inventory">📦</div>
                      <div className="animated-element milk">🥛</div>
                      <div className="animated-element money">💰</div>
                    </div>
                    <div className="animation-row">
                      <div className="animated-element chart">📊</div>
                      <div className="animated-element truck">🚚</div>
                      <div className="animated-element growth">📈</div>
                    </div>
                  </div>
                  <p className="animation-caption mt-3">
                    Inventory + Finance + Supply Chain = Complete Farm Management
                  </p>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section py-5 bg-light">
        <Container>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <h2 className="mb-3">Complete Farm Management Solution</h2>
            <p className="lead">Everything you need to run a successful dairy operation</p>
          </motion.div>
          <Row>
            {features.map((feature, index) => (
              <Col lg={4} md={6} key={index} className="mb-4">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="feature-card h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-4">
                      <div 
                        className="feature-icon mb-3"
                        style={{ color: feature.color }}
                      >
                        {feature.icon}
                      </div>
                      <Card.Title className="h5">{feature.title}</Card.Title>
                      <Card.Text className="text-muted">{feature.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Farmer Benefits Section */}
      <section className="benefits-section py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="mb-4">Empowering Farmers with Technology</h2>
                <p className="lead mb-4">
                  Our inventory and financial management tools help you focus on what you do best - 
                  producing quality milk, while we handle the business side.
                </p>
                <div className="benefits-list">
                  {farmerBenefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="benefit-item d-flex align-items-center mb-3"
                      initial={{ x: -30, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="benefit-icon me-3" style={{ color: '#00B894' }}>
                        {benefit.icon}
                      </div>
                      <div>
                        <h5 className="mb-1">{benefit.title}</h5>
                        <p className="text-muted mb-0">{benefit.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="financial-dashboard-preview"
              >
                <div className="dashboard-card">
                  <div className="dashboard-header">
                    <h5>Farmer Financial Dashboard</h5>
                    <span>Live</span>
                  </div>
                  <div className="dashboard-metrics">
                    {financialFeatures.map((feature, index) => (
                      <div key={index} className="metric-item">
                        <span className="metric-icon">{feature.icon}</span>
                        <div className="metric-content">
                          <div className="metric-name">{feature.metric}</div>
                          <div className="metric-value">{feature.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="dashboard-chart">
                    <div className="chart-bar" style={{ height: '80%' }}></div>
                    <div className="chart-bar" style={{ height: '60%' }}></div>
                    <div className="chart-bar" style={{ height: '90%' }}></div>
                    <div className="chart-bar" style={{ height: '70%' }}></div>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Process Flow Section */}
      <section className="process-section py-5 bg-light">
        <Container>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <h2 className="mb-3">Integrated Farm Management Workflow</h2>
            <p className="lead">Seamless integration of production, inventory, and finances</p>
          </motion.div>
          <Row className="g-4">
            {processSteps.map((step, index) => (
              <Col lg={4} md={6} key={step.step}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="process-card h-100 border-0 shadow-sm">
                    <Card.Body className="text-center p-4">
                      <div className="step-number mb-3">
                        <span className="step-badge">{step.step}</span>
                      </div>
                      <div className="step-icon mb-3" style={{ fontSize: '3rem' }}>
                        {step.icon}
                      </div>
                      <Card.Title className="h5 mb-3">{step.title}</Card.Title>
                      <Card.Text className="text-muted">{step.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5 bg-primary text-white">
        <Container>
          <Row>
            {stats.map((stat, index) => (
              <Col lg={2} md={4} key={index} className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="stat-item p-3">
                    <div className="stat-icon mb-2" style={{ fontSize: '2.5rem' }}>
                      {stat.icon}
                    </div>
                    <h3 className="stat-value fw-bold">{stat.value}</h3>
                    <p className="stat-label mb-0">{stat.label}</p>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <Container>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="mb-4">Ready to Transform Your Dairy Business?</h2>
            <p className="lead mb-4">
              Join thousands of farmers who have increased profits by 2.5x with our complete management solution
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Button 
                variant="primary" 
                size="lg"
                onClick={navigate('/login')}
                className="px-5 py-3"
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outline-primary" 
                size="lg"
                className="px-5 py-3"
              >
                Schedule Demo
              </Button>
            </div>
            <p className="text-muted mt-3">
              No credit card required • 30-day free trial • Setup in minutes
            </p>
          </motion.div>
        </Container>
      </section>
    </motion.div>
  );
};

export default WelcomePage;