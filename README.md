# OYSIRS - Oyo State Internal Revenue Service

A cloud-native serverless application built with AWS CDK for managing internal revenue operations for Oyo State, Nigeria.

## 📋 Overview

OYSIRS is a comprehensive full-stack application that provides a modern web interface for revenue management, customer tracking, and data processing. The infrastructure is fully defined as code using AWS CDK (Python) and deploys a serverless architecture on AWS.

## 🏗️ Architecture

The application consists of the following main components:

### Infrastructure Components

- **API Layer**: REST API built with AWS API Gateway and Lambda functions
- **Database Layer**: PostgreSQL RDS database with automated migrations using Alembic
- **Authentication**: AWS Cognito-based authentication system
- **User Interface**: Next.js 15 application with React 19
- **Storage**: S3 buckets for bank data and file uploads
- **Shared Resources**: VPC, security groups, and Lambda layers

### Key Features

- 📊 Customer management and tracking
- 📁 File upload and processing (Excel, Parquet)
- 🏦 Bank data integration and processing
- 📈 Transaction tables and reporting
- 🔐 Secure authentication with AWS Cognito
- 📱 Responsive web interface
- 🚀 Serverless architecture for scalability

## 🛠️ Tech Stack

### Backend
- **Infrastructure**: AWS CDK (Python 3.12+)
- **Runtime**: AWS Lambda (Python)
- **API**: AWS API Gateway
- **Database**: Amazon RDS (PostgreSQL)
- **Authentication**: AWS Cognito
- **Storage**: Amazon S3
- **Networking**: AWS VPC

### Frontend
- **Framework**: Next.js 15.5.3
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Authentication**: react-oidc-context
- **Data Processing**: XLSX for Excel handling

### Development Tools
- **Package Manager**: Hatch
- **Linting**: ESLint
- **Type Checking**: TypeScript, mypy
- **Testing**: Python unittest

## 📦 Prerequisites

- Python 3.12 or higher
- Node.js 20+ and npm
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed (`npm install -g aws-cdk`)
- Docker (for containerized Lambda functions)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd oysirs
```

### 2. Install Python Dependencies

```bash
# Install using pip
pip install -e .

# Or using hatch
hatch env create
```

### 3. Install Frontend Dependencies

```bash
cd oysirs/user_interface/next-app
npm install
```

### 4. Configure AWS Account

Update the account and region in `app.py`:

```python
env=cdk.Environment(account='YOUR_ACCOUNT_ID', region='YOUR_REGION')
```

### 5. Bootstrap CDK (First Time Only)

```bash
cdk bootstrap aws://ACCOUNT_ID/REGION
```

### 6. Deploy the Stack

```bash
# Synthesize CloudFormation template
cdk synth

# Deploy to AWS
cdk deploy
```

## 📁 Project Structure

```
oysirs/
├── app.py                      # CDK app entry point
├── cdk.json                    # CDK configuration
├── pyproject.toml              # Python project configuration
├── oysirs/
│   ├── oysirs_stack.py         # Main CDK stack
│   ├── api/                    # API Gateway and Lambda functions
│   │   ├── rest_api.py         # REST API construct
│   │   ├── banks_s3_buckets/   # Bank data processing
│   │   └── functions/          # Lambda handlers
│   ├── databases/              # RDS database setup
│   │   └── functions/migrate/  # Alembic migrations
│   ├── authentications/        # Cognito authentication
│   ├── user_interface/         # Next.js frontend
│   │   └── next-app/
│   ├── shared/                 # Shared resources (VPC, layers)
│   └── layer/                  # Lambda layers
└── tests/                      # Unit and integration tests
```

## 🔧 Development

### Working with the Frontend

```bash
cd oysirs/user_interface/next-app

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### CDK Development

```bash
# Watch for changes and auto-deploy
cdk watch

# Diff against deployed stack
cdk diff

# Destroy the stack
cdk destroy
```

### Database Migrations

Migrations are managed using Alembic and automatically run via Lambda on deployment:

```bash
cd oysirs/databases/functions/migrate

# Create a new migration
alembic revision -m "description"

# View migration history
alembic history
```

## 🌐 API Endpoints

The REST API provides the following endpoint groups:

- `/health` - Health check endpoints
- `/customers` - Customer management
- `/uploads` - File upload handling
- `/records` - Data records management

## 🔐 Authentication

The application uses AWS Cognito for authentication with OIDC integration in the frontend. Users must authenticate before accessing protected resources.

## 📊 Database Schema

The PostgreSQL database includes tables for:
- Customers
- Transactions
- Upload records
- Bank data

Migrations are located in `oysirs/databases/functions/migrate/versions/`.

## 🧪 Testing

```bash
# Run unit tests
python -m pytest tests/unit/

# Run specific test file
python -m pytest tests/unit/test_oysirs_stack.py
```

## 📝 Environment Variables

The Lambda functions use the following environment variables (automatically configured by CDK):

- `DATABASE_SECRET_ARN` - RDS credentials secret ARN
- `USER_POOL_ID` - Cognito user pool ID
- `BUCKET_NAME` - S3 bucket name
- Various VPC and networking configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Ahmad A. Khidir**
- Email: khidirahmad05@gmail.com

## 🙏 Acknowledgments

- AWS CDK team for the excellent infrastructure-as-code framework
- Next.js team for the powerful React framework
- AWS Lambda Powertools for Python utilities

## 📚 Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Lambda Powertools](https://awslabs.github.io/aws-lambda-powertools-python/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)

## 🐛 Known Issues

- Ensure Docker is running for containerized Lambda deployments
- First deployment may take 15-20 minutes due to RDS provisioning
- VPC and security group configurations must be reviewed for production use

## 🔄 Deployment Region

Current deployment target: **af-south-1** (Africa - Cape Town)

For deployment to other regions, update the region in `app.py`.
