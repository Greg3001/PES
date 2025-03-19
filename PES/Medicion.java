package models;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import play.db.jpa.Model;
import java.time.LocalDateTime;

@Entity
public class Medicion extends Model {
    public double valor;
    public LocalDateTime fechaHora;

    @ManyToOne
    public Contaminante contaminante;

    @ManyToOne
    public Ubicacion ubicacion;

    public Medicion(double valor, LocalDateTime fechaHora, Contaminante contaminante, Ubicacion ubicacion) {
        this.valor = valor;
        this.fechaHora = fechaHora;
        this.contaminante = contaminante;
        this.ubicacion = ubicacion;
    }

    public Medicion() {
        this.valor = 0.0;
        this.fechaHora = LocalDateTime.now();
    }
}