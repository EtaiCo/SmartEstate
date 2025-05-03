pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Backend') {
            steps {
                dir('backend') {
                    sh 'pip3 install -r requirements.txt'
                }
            }
        }

        stage('Start Backend') {
            steps {
                dir('backend') {
                    // Start the FastAPI server in the background
                    sh 'uvicorn main:app --host 0.0.0.0 --port 8000 &'
                    // Wait for the server to start
                    sh 'sleep 10'
                    // Optional: verify the server is running
                    sh 'curl http://localhost:8000/docs || true'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    sh 'python3 -m pytest --maxfail=1 --disable-warnings -q'
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
            // Kill any running uvicorn processes
            sh 'pkill -f uvicorn || true'
        }
    }
}