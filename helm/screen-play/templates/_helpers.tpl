{{/*
Common labels for all resources
*/}}
{{- define "helm-chart.labels" -}}
app: {{ .Chart.Name }}
release: {{ .Release.Name }}
{{- end -}}

{{/*
Generate a full name for any resource
*/}}
{{- define "helm-chart.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

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
{{- define "helm-chart.postgres.image" -}}
{{ printf "%s:%s" .Values.server.image.repository .Values.server.image.tag }}
{{- end -}}

{{/*
Client image name with the tag
*/}}
{{- define "helm-chart.postgres.image" -}}
{{ printf "%s:%s" .Values.frontend.image.repository .Values.frontend.image.tag }}
{{- end -}}

