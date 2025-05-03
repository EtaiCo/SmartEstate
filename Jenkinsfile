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
                dir('backend') {  // or wherever your Python code is
                    sh 'pip3 install -r requirements.txt'
                }
            }
        }

        stage('Test Backend') {
            steps {
                dir('backend') {  // or wherever your Python code is
                    sh 'pytest'
                }
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