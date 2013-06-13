render:
#	lessc css/base.less css/base.css
	harp.py

publish:
	chmod 755 site
	#rsync -e "ssh -4" -avz site/ pauladamsmith.com:~/web/public/
	#rsync -e ssh -avz site/ paulsmith@108.59.11.82:~/webapps/pauladamsmith/
	s3cmd -c ~/.s3cfg-paulsmith@gmail.com sync --no-preserve --acl-public --reduced-redundancy site/ s3://pauladamsmith.com/
