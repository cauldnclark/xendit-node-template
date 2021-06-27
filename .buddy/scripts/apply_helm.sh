helm repo add xendit-repo s3://helm-repos-prod && helm repo update

helm template  \
    -f .deployment/helm/${AWS_DEPLOY_REGION}/${ENVIRONMENT}-${MODE}.yaml \
      xendit-repo/xendit-deployment $@ \
      --set change_cause="${CHANGE_CAUSE}" \
      --set image.tag="${RELEASE_TAG}" > k8s.yaml
