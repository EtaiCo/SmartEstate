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
                // Install requirements directly (without virtual environment)
                sh 'pip3 install -r requirements.txt'
            }
        }

        stage('Test Backend') {
            steps {
                // Run backend tests with pytest
                sh 'pytest --maxfail=1 --disable-warnings -q'
            }
        }

        stage('Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm test -- --watchAll=false'
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