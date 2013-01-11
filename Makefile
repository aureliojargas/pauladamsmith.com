render:
	lessc css/base.less css/base.css
	static.py

publish:
	chmod 755 site
	#rsync -e "ssh -4" -avz site/ pauladamsmith.com:~/web/public/
	rsync -e ssh -avz site/ paulsmith@108.59.11.82:~/webapps/pauladamsmith/
