FROM postgres:16-alpine

# Set environment variables
ENV POSTGRES_DB=${POSTGRES_DB:-freelivery}
ENV POSTGRES_USER=${POSTGRES_USER:-postgres}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}

# Copy SQL initialization scripts into the container
# PostgreSQL automatically runs *.sql files in /docker-entrypoint-initdb.d/ during container startup
COPY ./init-scripts/ /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}
