pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'docker run --rm -v "${WORKSPACE}:/app" -w /app python:2-alpine python -m py_compile sources/add2vals.py sources/calc.py'
            }
        }
        stage('Test') {
            steps {
                sh 'docker run --rm -v "${WORKSPACE}:/app" -w /app qnib/pytest py.test --verbose --junit-xml test-reports/results.xml sources/test_calc.py'
                junit 'test-reports/results.xml'
            }
        }
    }
}