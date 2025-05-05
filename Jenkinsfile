pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                // Get code from your repository
                checkout scm
            }
        }
        
        stage('Setup') {
            steps {
                // Check Python version - note we're using sh for Linux (Jenkins server)
                sh 'python3 --version'
                
                // Create directory for test reports
                sh 'mkdir -p test-reports'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    // Install Python dependencies globally
                    sh 'pip3 install --user -r requirements.txt'
                    
                    // Install pytest if not in requirements
                    sh 'pip3 install --user pytest pytest-cov'
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                dir('backend') {
                    // Run pytest with verbose output and generate XML report
                    sh 'python3 -m pytest --verbose --junit-xml ../test-reports/results.xml'
                }
            }
            post {
                always {
                    // Publish test results
                    junit 'test-reports/results.xml'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                // This is an example of how to start the service
                // For actual deployment, you might need a different approach
                dir('backend') {
                    // Start the service in the background
                    sh 'nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &'
                }
                
                echo 'Deployment completed'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline executed successfully!'
        }
        failure {
            echo 'Pipeline execution failed!'
        }
    }
}