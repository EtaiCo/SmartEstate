pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {
                    // Install requirements directly without virtual environment
                    sh 'pip3 install -r requirements.txt --user'
                    // Run tests using python -m pytest to ensure it finds the module
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
    }
}