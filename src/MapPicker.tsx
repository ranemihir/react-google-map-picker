import React, { FC } from 'react';

type Location = {
    lat: number,
    lng: number
}

enum MapTypeId {
    Roadmap = 'roadmap',
    Satellite = 'satellite',
    Hybrid = 'hybrid',
    Terrain = 'terrain'
}

type Props = {
    defaultLocation: Location;
    zoom?: number;
    onChangeLocation?(lat: number, lng: number): void;
    onChangeZoom?(zoom: number): void;
    style?: any;
    className?: string;
    mapTypeId?: MapTypeId
}

function isValidLocation(location: Location) {
    return location && Math.abs(location.lat) <= 90 && Math.abs(location.lng) <= 180;
}


const MapPicker: FC<Props> = ({ defaultLocation, zoom = 7, onChangeLocation, onChangeZoom, style, className, mapTypeId }) => {
    const MAP_VIEW_ID = 'google-map-view-' + Math.random().toString(36).substr(2, 9);
    const map = React.useRef<any>(null);
    const marker = React.useRef<any>(null);

    function handleChangeLocation() {
        if (onChangeLocation) {
            const currentLocation = marker.current.getPosition();
            onChangeLocation(currentLocation.lat(), currentLocation.lng());
        }
    }

    function handleChangeZoom() {
        onChangeZoom && onChangeZoom(map.current.getZoom());
    }

    function loadMap() {
        const Google = (window as any).google;
        const validLocation = isValidLocation(defaultLocation) ? defaultLocation : { lat: 0, lng: 0 };

        map.current = new Google.maps.Map(document.getElementById(MAP_VIEW_ID),
            {
                center: validLocation,
                zoom: zoom,
                ...(mapTypeId && { mapTypeId })
            });

        if (!marker.current) {
            marker.current = new Google.maps.Marker({
                position: validLocation,
                map: map.current,
                draggable: true
            });
            Google.maps.event.addListener(marker.current, 'dragend', handleChangeLocation);
        } else {
            marker.current.setPosition(validLocation);
        }

        map.current.addListener('click', function (event: any) {
            const clickedLocation = event.latLng;

            marker.current.setPosition(clickedLocation);
            handleChangeLocation();
        });

        map.current.addListener('zoom_changed', handleChangeZoom);
    }

    React.useEffect(() => {
        loadMap();
    }, [])  // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        if (marker.current) {
            map.current.setCenter(defaultLocation);
            marker.current.setPosition(defaultLocation);
        }
    }, [defaultLocation]);

    React.useEffect(() => {
        if (map.current) {
            map.current.setZoom(zoom);
        }
    }, [zoom]);

    const componentStyle = Object.assign({ width: '100%', height: '600px' }, style || {});

    return (
        <div id={MAP_VIEW_ID} style={componentStyle} className={className}></div>
    );
};
export default MapPicker;