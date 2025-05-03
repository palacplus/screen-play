{{/*
Common labels for all resources
*/}}
{{- define "helm-chart.labels" -}}
app: {{ .Chart.Name }}
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
Postgres image name with the tag
*/}}
{{- define "helm-chart.postgres.image" -}}
{{ printf "%s:%s" .Values.postgres.image.repository .Values.postgres.image.tag }}
{{- end -}}

{{/*
Server image name with the tag
*/}}
{{- define "helm-chart.server.image" -}}
{{ printf "%s:%s" .Values.server.image.repository .Values.server.image.tag }}
{{- end -}}

{{/*
Client image name with the tag
*/}}
{{- define "helm-chart.frontend.image" -}}
{{ printf "%s:%s" .Values.frontend.image.repository .Values.frontend.image.tag }}
{{- end -}}

