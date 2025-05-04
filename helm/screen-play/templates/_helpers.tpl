{{/*
Common labels for all resources
*/}}
{{- define "helm-chart.labels" -}}
release: {{ .Release.Name }}
{{- end -}}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "helm-chart.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Get the name of the chart
*/}}
{{- define "helm-chart.name" -}}
{{ .Chart.Name }}
{{- end -}}

{{/*
Common annotations for all resources
*/}}
{{- define "helm-chart.annotations" -}}
{{- if .Values.annotations }}
{{ toYaml .Values.annotations | nindent 4 }}
{{- end }}
{{- end -}}


{{/*
Generate a name for the PostgreSQL deployment
*/}}
{{- define "helm-chart.postgres.fullname" -}}
{{- printf "%s-postgres" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create the database connection string
*/}}
{{- define "helm-chart.postgres.connectionString" -}}
{{ printf "Server=postgres;Port=%s;Database=%s;User Id=%s;Password=%s;" (.Values.postgresql.containerPorts.postgresql | toString) .Values.postgresql.auth.database .Values.postgresql.auth.username .Values.postgresql.auth.password }}
{{- end -}}
