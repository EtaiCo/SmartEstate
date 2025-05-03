pipeline {
    agent any

    environment {
        VENV_DIR = 'env'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Backend') {
            steps {
                dir('backend') {
                    // Create virtual environment
                    sh 'python3 -m venv ${VENV_DIR}'
                    // Activate and install requirements
                    sh '. ${VENV_DIR}/bin/activate && pip install -r requirements.txt'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    // Activate virtual environment and run tests
                    sh '. ${VENV_DIR}/bin/activate && pytest --maxfail=1 --disable-warnings -q'
                }
            }
        }

        stage('Start Backend') {
            steps {
                dir('backend') {
                    // Start the FastAPI server
                    sh '. ${VENV_DIR}/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000 &'
                    // Wait for server to start
                    sh 'sleep 5'
                    // Test if server is running
                    sh 'curl http://localhost:8000 || echo "Server not ready"'
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs for details.'
        }
        always {
            // Clean up by killing uvicorn process
            sh 'pkill -f uvicorn || true'
        }
    }
}