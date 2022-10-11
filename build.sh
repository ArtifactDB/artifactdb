#!/bin/bash

if [ $# -lt 1 ]
then
    echo "should pass an argument 'main' or 'browser'"
    exit 1
fi

chosen=$1
suffix=""
if [ $chosen == "main" ]
then
    suffix="node"
elif [ $chosen == "browser" ]
then
    suffix="web"
else
    echo "first argument should be 'main' or 'browser'"
    exit 1
fi

rm -rf $chosen
mkdir $chosen
cp src/*.js $chosen

mkdir $chosen/abstract
for x in $(ls src/abstract/*_${suffix}.js)
do
    newname=$(basename $x | sed "s/_${suffix}//")
    cp $x $chosen/abstract/$newname
done
