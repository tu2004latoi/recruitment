package com.dtt.config;

import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.format.DateTimeFormatter;

@Configuration
public class JacksonConfig {
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer customizer() {
        return builder -> builder
                .simpleDateFormat("yyyy-MM-dd")
                .serializers(new LocalDateSerializer(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
                .deserializers(new LocalDateDeserializer(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
    }
}
